import { create } from "zustand";
import type { Material } from "./materials";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  citations?: { anchor: string }[];
  follow_ups?: string[];
  insufficient_evidence?: boolean;
  contact?: string;
}

export interface ModalSource {
  title: string;
  content_type: string;
  path?: string;
  document_id?: string;
  status?: string;
}

export interface DossierData {
  summary?: string | null;
  page_count?: number | null;
  language?: string;
  status?: string;
}

export interface RelatedMaterial {
  document_id: string;
  title: string;
  content_type?: string;
  score?: number;
}

interface ModalState {
  open: boolean;
  material: Material | null;
  lastViewedId: string | null;
  sources: ModalSource[];
  chat: ChatMessage[];
  preview: Record<string, unknown> | null;
  dossier: DossierData | null;
  relatedMaterials: RelatedMaterial[];
  documentTags: { id: string; name: string }[];
  tagSuggestions: { id: string; name: string }[];
  openModal: (m: Material) => void;
  closeModal: () => void;
  setMaterial: (m: Material) => void;
  setSources: (s: ModalSource[]) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChat: (c: ChatMessage[]) => void;
  setPreview: (p: Record<string, unknown> | null) => void;
  setDossier: (d: DossierData | null) => void;
  setRelatedMaterials: (r: RelatedMaterial[]) => void;
  setDocumentTags: (t: { id: string; name: string }[]) => void;
  setTagSuggestions: (t: { id: string; name: string }[]) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  open: false,
  material: null,
  lastViewedId: null,
  sources: [],
  chat: [],
  preview: null,
  dossier: null,
  relatedMaterials: [],
  documentTags: [],
  tagSuggestions: [],
  openModal: (m) => set({
    open: true, material: m, lastViewedId: m.document_id, sources: [], chat: [],
    preview: null, dossier: null, relatedMaterials: [],
    documentTags: [], tagSuggestions: [],
  }),
  closeModal: () => set({
    open: false, material: null, sources: [], chat: [],
    preview: null, dossier: null, relatedMaterials: [],
    documentTags: [], tagSuggestions: [],
  }),
  setMaterial: (material) => set({ material }),
  setSources: (sources) => set({ sources }),
  addChatMessage: (msg) => set((s) => ({ chat: [...s.chat, msg] })),
  setChat: (chat) => set({ chat }),
  setPreview: (preview) => set({ preview }),
  setDossier: (dossier) => set({ dossier }),
  setRelatedMaterials: (relatedMaterials) => set({ relatedMaterials }),
  setDocumentTags: (documentTags) => set({ documentTags }),
  setTagSuggestions: (tagSuggestions) => set({ tagSuggestions }),
}));
