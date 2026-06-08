import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSSEStream } from "./useSSEStream";
import { useAuthStore } from "../stores/auth";

// Helper to build a ReadableStream from SSE chunks
function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let idx = 0;
  return new ReadableStream({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx++]));
      } else {
        controller.close();
      }
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ session: null });
  vi.restoreAllMocks();
});

describe("useSSEStream", () => {
  it("starts with isStreaming=false", () => {
    const { result } = renderHook(() => useSSEStream());
    expect(result.current.isStreaming).toBe(false);
  });

  it("appends stream=true query parameter", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream([]),
    } as unknown as Response);

    const { result } = renderHook(() => useSSEStream());
    await act(() => result.current.start("/api/test", {}, {}));

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/test?stream=true",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("appends &stream=true when URL already has query params", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream([]),
    } as unknown as Response);

    const { result } = renderHook(() => useSSEStream());
    await act(() => result.current.start("/api/test?scope=all", {}, {}));

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/test?scope=all&stream=true",
      expect.anything(),
    );
  });

  it("sends auth headers from session", async () => {
    useAuthStore.getState().login({
      email: "user@bi.group",
      role: "admin",
      business_unit: "HQ",
      geo: "KZ",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream([]),
    } as unknown as Response);

    const { result } = renderHook(() => useSSEStream());
    await act(() => result.current.start("/api/test", {}, {}));

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["X-User-Email"]).toBe("user@bi.group");
    expect(headers["X-User-Role"]).toBe("admin");
    expect(headers["X-Business-Unit"]).toBe("HQ");
    expect(headers["X-User-Geo"]).toBe("KZ");
  });

  it("calls onToken for each token event", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream([
        'data: {"token": "Hello"}\n\n',
        'data: {"token": " world"}\n\n',
      ]),
    } as unknown as Response);

    const tokens: string[] = [];
    const { result } = renderHook(() => useSSEStream());

    await act(() =>
      result.current.start("/api/test", {}, {
        onToken: (t) => tokens.push(t),
      }),
    );

    expect(tokens).toEqual(["Hello", " world"]);
  });

  it("calls onDone when done event received", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream([
        'data: {"token": "Hi"}\n\ndata: {"done": true, "answer": "Hi", "sources": []}\n\n',
      ]),
    } as unknown as Response);

    let doneData: Record<string, unknown> | null = null;
    const { result } = renderHook(() => useSSEStream());

    await act(() =>
      result.current.start("/api/test", {}, {
        onDone: (d) => { doneData = d; },
      }),
    );

    expect(doneData).toEqual({ done: true, answer: "Hi", sources: [] });
  });

  it("calls onError for error events", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream(['data: {"error": "timeout"}\n\n']),
    } as unknown as Response);

    let errorMsg = "";
    const { result } = renderHook(() => useSSEStream());

    await act(() =>
      result.current.start("/api/test", {}, {
        onError: (e) => { errorMsg = e; },
      }),
    );

    expect(errorMsg).toBe("timeout");
  });

  it("calls onError for HTTP errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      body: null,
    } as unknown as Response);

    let errorMsg = "";
    const { result } = renderHook(() => useSSEStream());

    await act(() =>
      result.current.start("/api/test", {}, {
        onError: (e) => { errorMsg = e; },
      }),
    );

    expect(errorMsg).toBe("HTTP 500");
  });

  it("sets isStreaming during stream", async () => {
    let resolve: () => void = () => {};
    new Promise<void>((r) => { resolve = r; });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream(['data: {"token": "x"}\n\n']),
    } as unknown as Response);

    const { result } = renderHook(() => useSSEStream());

    await act(() => result.current.start("/api/test", {}, {
      onToken: () => { resolve!(); },
    }));

    // After completion, isStreaming should be false
    expect(result.current.isStreaming).toBe(false);
  });

  it("skips malformed JSON lines", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      body: sseStream([
        'data: not-json\n\ndata: {"token": "ok"}\n\n',
      ]),
    } as unknown as Response);

    const tokens: string[] = [];
    const { result } = renderHook(() => useSSEStream());

    await act(() =>
      result.current.start("/api/test", {}, {
        onToken: (t) => tokens.push(t),
      }),
    );

    expect(tokens).toEqual(["ok"]);
  });
});
