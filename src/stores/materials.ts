import { create } from "zustand";

export interface Material {
  document_id: string;
  title: string;
  content_type: string;
  scope: string;
  business_unit: string;
  status: string;
  created_at: string;
  updated_at?: string;
  source_language?: string;
  tags?: { id: string; name: string }[];
  topic_ids?: string[];
  title_i18n?: Record<string, string>;
  cardSummary?: { card_id: string; summary?: string };
  snippet?: string;
  author?: string;
  language?: string;
  classification?: string;
  possible_duplicate?: boolean;
}

interface MaterialsState {
  materials: Material[];
  loading: boolean;
  searchQuery: string;
  scopeFilter: string;
  selectedTags: string[];
  allTags: { id: string; name: string }[];
  searchResults: Material[] | null;
  searchPending: boolean;
  setMaterials: (m: Material[]) => void;
  updateMaterial: (m: Material) => void;
  setLoading: (l: boolean) => void;
  setSearchQuery: (q: string) => void;
  setScopeFilter: (s: string) => void;
  setSelectedTags: (t: string[]) => void;
  setAllTags: (t: { id: string; name: string }[]) => void;
  setSearchResults: (r: Material[] | null) => void;
  setSearchPending: (p: boolean) => void;
  selectedIds: Set<string>;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
  bookmarkFilter: boolean;
  setBookmarkFilter: (on: boolean) => void;
}

export const useMaterialsStore = create<MaterialsState>((set) => ({
  materials: [],
  loading: false,
  searchQuery: "",
  scopeFilter: "all",
  selectedTags: [],
  allTags: [],
  searchResults: null,
  searchPending: false,
  setMaterials: (materials) => set({ materials }),
  updateMaterial: (m) => set((s) => ({
    materials: s.materials.map((x) => x.document_id === m.document_id ? m : x),
  })),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setScopeFilter: (scopeFilter) => set({ scopeFilter }),
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  setAllTags: (allTags) => set({ allTags }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchPending: (searchPending) => set({ searchPending }),
  selectedIds: new Set<string>(),
  toggleSelected: (id) => set((s) => {
    const next = new Set(s.selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { selectedIds: next };
  }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  bookmarks: new Set<string>(JSON.parse(localStorage.getItem("bookmarks") || "[]")),
  toggleBookmark: (id) => set((s) => {
    const next = new Set(s.bookmarks);
    if (next.has(id)) next.delete(id); else next.add(id);
    localStorage.setItem("bookmarks", JSON.stringify([...next]));
    return { bookmarks: next };
  }),
  bookmarkFilter: false,
  setBookmarkFilter: (bookmarkFilter) => set({ bookmarkFilter }),
}));
