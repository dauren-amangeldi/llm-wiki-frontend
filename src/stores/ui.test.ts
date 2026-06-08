import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "./ui";

beforeEach(() => {
  localStorage.clear();
  useUiStore.setState({
    theme: "light",
    language: "ru",
    mode: "expert",
    viewMode: "list",
    activeTab: "dashboard",
    userPosition: "employee",
    openMenu: null,
    searchOpen: false,
  });
});

describe("useUiStore", () => {
  it("has correct defaults", () => {
    const state = useUiStore.getState();
    expect(state.theme).toBe("light");
    expect(state.language).toBe("ru");
    expect(state.mode).toBe("expert");
    expect(state.viewMode).toBe("list");
  });

  it("setTheme updates state and localStorage", () => {
    useUiStore.getState().setTheme("dark");
    expect(useUiStore.getState().theme).toBe("dark");
    expect(localStorage.getItem("bi_theme")).toBe("dark");
  });

  it("setLanguage updates state and localStorage", () => {
    useUiStore.getState().setLanguage("en");
    expect(useUiStore.getState().language).toBe("en");
    expect(localStorage.getItem("bi_language")).toBe("en");
  });

  it("setMode updates mode", () => {
    useUiStore.getState().setMode("advisor");
    expect(useUiStore.getState().mode).toBe("advisor");
  });

  it("setViewMode updates state and persists", () => {
    useUiStore.getState().setViewMode("grid");
    expect(useUiStore.getState().viewMode).toBe("grid");
    expect(localStorage.getItem("bi_viewMode")).toBe("grid");
  });

  it("toggleSearch flips searchOpen", () => {
    expect(useUiStore.getState().searchOpen).toBe(false);
    useUiStore.getState().toggleSearch();
    expect(useUiStore.getState().searchOpen).toBe(true);
    useUiStore.getState().toggleSearch();
    expect(useUiStore.getState().searchOpen).toBe(false);
  });

  it("closeSearch sets searchOpen to false", () => {
    useUiStore.getState().toggleSearch();
    useUiStore.getState().closeSearch();
    expect(useUiStore.getState().searchOpen).toBe(false);
  });

  it("setActiveTab changes tab", () => {
    useUiStore.getState().setActiveTab("materials");
    expect(useUiStore.getState().activeTab).toBe("materials");
  });

  it("setOpenMenu sets and clears menu", () => {
    useUiStore.getState().setOpenMenu("user");
    expect(useUiStore.getState().openMenu).toBe("user");
    useUiStore.getState().setOpenMenu(null);
    expect(useUiStore.getState().openMenu).toBeNull();
  });
});
