import { create } from "zustand";
import { readJson, writeJson } from "../lib/storage";

export interface Session {
  email: string;
  role: string;
  business_unit: string;
  geo: string;
}

const _DEFAULT_SESSION: Session = {
  email: "demo@bi.group",
  role: "admin",
  business_unit: "HQ",
  geo: "KZ",
};

interface AuthState {
  session: Session | null;
  login: (s: Session) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Use stored session if available, otherwise fall back to the demo session
  // so the app goes straight to Workspace without a LoginPage.
  session: readJson<Session | null>("bi_session", null) ?? _DEFAULT_SESSION,
  login: (s) => { writeJson("bi_session", s); set({ session: s }); },
  logout: () => { writeJson("bi_session", null); set({ session: null }); },
}));
