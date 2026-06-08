import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ session: null });
});

describe("useAuthStore", () => {
  const mockSession = {
    email: "test@bi.group",
    role: "admin",
    business_unit: "HQ",
    geo: "KZ",
  };

  it("starts with null session", () => {
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("login sets session", () => {
    useAuthStore.getState().login(mockSession);
    expect(useAuthStore.getState().session).toEqual(mockSession);
  });

  it("login persists to localStorage", () => {
    useAuthStore.getState().login(mockSession);
    const stored = JSON.parse(localStorage.getItem("bi_session")!);
    expect(stored.email).toBe("test@bi.group");
  });

  it("logout clears session", () => {
    useAuthStore.getState().login(mockSession);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("logout clears localStorage", () => {
    useAuthStore.getState().login(mockSession);
    useAuthStore.getState().logout();
    expect(JSON.parse(localStorage.getItem("bi_session")!)).toBeNull();
  });
});
