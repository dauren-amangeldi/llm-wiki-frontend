import { create } from "zustand";

export interface NotebookFile {
  file_id: string;
  original_name: string;
  status: string;
}

export interface Notebook {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  files: NotebookFile[];
}

interface NotebooksState {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  loading: boolean;
  setNotebooks: (n: Notebook[]) => void;
  setActiveNotebookId: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  upsertNotebook: (n: Notebook) => void;
  removeNotebook: (id: string) => void;
}

export const useNotebooksStore = create<NotebooksState>((set) => ({
  notebooks: [],
  activeNotebookId: null,
  loading: false,
  setNotebooks: (notebooks) => set({ notebooks }),
  setActiveNotebookId: (activeNotebookId) => set({ activeNotebookId }),
  setLoading: (loading) => set({ loading }),
  upsertNotebook: (n) => set((s) => ({
    notebooks: [n, ...s.notebooks.filter((x) => x.id !== n.id)],
  })),
  removeNotebook: (id) => set((s) => ({
    notebooks: s.notebooks.filter((x) => x.id !== id),
    activeNotebookId: s.activeNotebookId === id ? null : s.activeNotebookId,
  })),
}));
