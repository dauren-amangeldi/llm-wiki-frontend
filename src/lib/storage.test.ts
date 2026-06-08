import { describe, it, expect, beforeEach } from "vitest";
import { readStorage, writeStorage, readJson, writeJson } from "./storage";

beforeEach(() => {
  localStorage.clear();
});

describe("readStorage / writeStorage", () => {
  it("reads null for missing key", () => {
    expect(readStorage("missing")).toBeNull();
  });

  it("round-trips a string", () => {
    writeStorage("key", "value");
    expect(readStorage("key")).toBe("value");
  });

  it("overwrites existing value", () => {
    writeStorage("key", "a");
    writeStorage("key", "b");
    expect(readStorage("key")).toBe("b");
  });
});

describe("readJson / writeJson", () => {
  it("returns fallback for missing key", () => {
    expect(readJson("nope", 42)).toBe(42);
  });

  it("round-trips an object", () => {
    const obj = { email: "test@bi.group", role: "admin" };
    writeJson("session", obj);
    expect(readJson("session", null)).toEqual(obj);
  });

  it("returns fallback for corrupt JSON", () => {
    localStorage.setItem("bad", "{invalid");
    expect(readJson("bad", "default")).toBe("default");
  });

  it("round-trips null", () => {
    writeJson("empty", null);
    expect(readJson("empty", "fallback")).toBeNull();
  });

  it("round-trips array", () => {
    writeJson("arr", [1, 2, 3]);
    expect(readJson("arr", [])).toEqual([1, 2, 3]);
  });
});
