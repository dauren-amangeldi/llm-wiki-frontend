import { create } from "zustand";
import { readStorage, writeStorage } from "../lib/storage";

type Theme = "light" | "dark";
type Language = "ru" | "en" | "kk";
type Mode = "library" | "expert" | "advisor";
type ViewMode = "grid" | "list";
type Tab = "dashboard" | "materials" | "wiki" | "notebooks" | "skills" | "guidelines";

interface UiState {
  theme: Theme;
  language: Language;
  mode: Mode;
  viewMode: ViewMode;
  activeTab: Tab;
  userPosition: string;
  openMenu: string | null;
  searchOpen: boolean;
  advisorActive: boolean;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setMode: (m: Mode) => void;
  setViewMode: (v: ViewMode) => void;
  setActiveTab: (t: Tab) => void;
  setUserPosition: (p: string) => void;
  setOpenMenu: (m: string | null) => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  setAdvisorActive: (v: boolean) => void;
}

const validTheme = (v: string | null): Theme => {
  if (v === "dark" || v === "light") return v;
  // Auto-detect from system preference
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
};
const validLang = (v: string | null): Language =>
  v === "en" || v === "kk" ? v : "ru";
const validView = (v: string | null): ViewMode => (v === "grid" ? "grid" : "list");

export const useUiStore = create<UiState>((set) => ({
  theme: validTheme(readStorage("bi_theme")),
  language: validLang(readStorage("bi_language")),
  mode: "expert",
  viewMode: validView(readStorage("bi_viewMode")),
  activeTab: "dashboard",
  userPosition: "employee",
  openMenu: null,
  searchOpen: false,
  advisorActive: false,

  setTheme: (t) => {
    writeStorage("bi_theme", t);
    document.body.dataset.theme = t;
    set({ theme: t });
  },
  setLanguage: (l) => { writeStorage("bi_language", l); document.documentElement.lang = l; set({ language: l }); },
  setMode: (m) => set({ mode: m }),
  setViewMode: (v) => { writeStorage("bi_viewMode", v); set({ viewMode: v }); },
  setActiveTab: (t) => set({ activeTab: t }),
  setUserPosition: (p) => set({ userPosition: p }),
  setOpenMenu: (m) => set({ openMenu: m }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  closeSearch: () => set({ searchOpen: false }),
  setAdvisorActive: (v) => set({ advisorActive: v }),
}));
