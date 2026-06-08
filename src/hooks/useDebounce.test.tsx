import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("debounces value updates", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    expect(result.current).toBe("a"); // not yet updated

    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("ab"); // now updated
  });

  it("resets timer on rapid changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: "x" } },
    );

    rerender({ value: "xy" });
    act(() => { vi.advanceTimersByTime(100); }); // half delay

    rerender({ value: "xyz" }); // reset timer
    act(() => { vi.advanceTimersByTime(100); }); // another half
    expect(result.current).toBe("x"); // still original

    act(() => { vi.advanceTimersByTime(100); }); // full 200ms from last change
    expect(result.current).toBe("xyz");
  });

  it("uses default delay of 300ms", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 1 } },
    );

    rerender({ value: 2 });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe(1);

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe(2);
  });
});
