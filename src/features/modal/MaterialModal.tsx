import { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useModalStore, type DossierData, type RelatedMaterial } from "../../stores/modal";
import { useMaterialsStore } from "../../stores/materials";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { SourcesColumn } from "./SourcesColumn";
import { ChatColumn } from "./ChatColumn";
import { StudioColumn } from "./StudioColumn";
import { MaterialHeader } from "./MaterialHeader";

export function MaterialModal() {
  const open = useModalStore((s) => s.open);
  const material = useModalStore((s) => s.material);
  const closeModal = useModalStore((s) => s.closeModal);
  const setSources = useModalStore((s) => s.setSources);
  const setDossier = useModalStore((s) => s.setDossier);
  const setRelatedMaterials = useModalStore((s) => s.setRelatedMaterials);
  const setDocumentTags = useModalStore((s) => s.setDocumentTags);
  const setTagSuggestions = useModalStore((s) => s.setTagSuggestions);
  const language = useUiStore((s) => s.language);
  const { t } = useTranslation();

  const [_dataLoading, setDataLoading] = useState(false);

  // Fetch document details when material changes
  useEffect(() => {
    if (!material) return;
    const ac = new AbortController();
    const docId = material.document_id;
    const sig = { signal: ac.signal };
    setDataLoading(true);

    const fetches = [
      apiFetch<{ items?: { title: string; content_type: string; path?: string }[] }>(
        `/api/v1/documents/${docId}/sources?language=${language}`, sig,
      )
        .then((res) => { if (!ac.signal.aborted) setSources(res.items ?? []); })
        .catch(() => { if (!ac.signal.aborted) setSources([]); }),

      apiFetch<DossierData>(`/api/v1/documents/${docId}/dossier?language=${language}`, sig)
        .then((res) => { if (!ac.signal.aborted) setDossier(res); })
        .catch(() => { if (!ac.signal.aborted) setDossier(null); }),

      apiFetch<{ items?: RelatedMaterial[] }>(`/api/v1/documents/${docId}/related?language=${language}`, sig)
        .then((res) => { if (!ac.signal.aborted) setRelatedMaterials(res.items ?? []); })
        .catch(() => { if (!ac.signal.aborted) setRelatedMaterials([]); }),

      apiFetch<{ tags?: { id: string; name: string }[]; suggestions?: { id: string; name: string }[] }>(
        `/api/v1/documents/${docId}/tags?language=${language}`, sig,
      )
        .then((res) => {
          if (ac.signal.aborted) return;
          setDocumentTags(res.tags ?? []);
          setTagSuggestions(res.suggestions ?? []);
        })
        .catch(() => {
          if (ac.signal.aborted) return;
          setDocumentTags([]);
          setTagSuggestions([]);
        }),
    ];

    Promise.allSettled(fetches).then(() => {
      if (!ac.signal.aborted) setDataLoading(false);
    });

    return () => { ac.abort(); };
  }, [material, language, setSources, setDossier, setRelatedMaterials, setDocumentTags, setTagSuggestions]);

  // Arrow navigation between materials
  const materials = useMaterialsStore((s) => s.materials);
  const openModal = useModalStore((s) => s.openModal);
  const currentIndex = material ? materials.findIndex((m) => m.document_id === material.document_id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < materials.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) openModal(materials[currentIndex - 1]);
  }, [hasPrev, materials, currentIndex, openModal]);

  const goToNext = useCallback(() => {
    if (hasNext) openModal(materials[currentIndex + 1]);
  }, [hasNext, materials, currentIndex, openModal]);

  // Close on Escape + arrow key navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return; }
      // Skip arrow nav when an input/textarea/select is focused
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goToPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goToNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal, goToPrev, goToNext]);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Reset collapsed state on material change
  useEffect(() => { setLeftCollapsed(false); setRightCollapsed(false); }, [material]);

  if (!open || !material) return null;

  const gridCls = [
    "material-modal-grid",
    leftCollapsed ? "left-collapsed" : "",
    rightCollapsed ? "right-collapsed" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="material-modal" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="material-modal-dialog">
        {/* Header */}
        <header className="material-modal-header">
          <MaterialHeader
            material={material}
            onClose={closeModal}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        </header>

        {/* 3-column grid */}
        <div className={gridCls}>
          <SourcesColumn collapsed={leftCollapsed} onToggle={() => setLeftCollapsed(!leftCollapsed)} />
          <ChatColumn />
          <StudioColumn collapsed={rightCollapsed} onToggle={() => setRightCollapsed(!rightCollapsed)} />
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="modal-keyboard-hint" aria-hidden="true">
          <kbd>←</kbd><kbd>→</kbd> <span>{t("nav_hint", "навигация")}</span>
          <kbd>Esc</kbd> <span>{t("close_hint", "закрыть")}</span>
        </div>
      </div>
    </div>
  );
}
