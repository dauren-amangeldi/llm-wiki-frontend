import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore, type Material } from "../../stores/materials";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";
import { ScopeBar } from "./ScopeBar";
import { SearchBar } from "./SearchBar";
import { AdvisorToggle } from "./AdvisorToggle";
import { TagFilterBar } from "./TagFilterBar";
import { MaterialsGrid } from "./MaterialsGrid";
import { MaterialGridSkeleton } from "../../components/Skeleton";

export function MaterialsPanel() {
  const { t } = useTranslation();
  const setMaterials = useMaterialsStore((s) => s.setMaterials);
  const setLoading = useMaterialsStore((s) => s.setLoading);
  const setAllTags = useMaterialsStore((s) => s.setAllTags);
  const materials = useMaterialsStore((s) => s.materials);
  const scopeFilter = useMaterialsStore((s) => s.scopeFilter);
  const selectedTags = useMaterialsStore((s) => s.selectedTags);
  const searchQuery = useMaterialsStore((s) => s.searchQuery);
  const bookmarks = useMaterialsStore((s) => s.bookmarks);
  const isLoading = useMaterialsStore((s) => s.loading);
  const bookmarkFilter = useMaterialsStore((s) => s.bookmarkFilter);
  const setBookmarkFilter = useMaterialsStore((s) => s.setBookmarkFilter);
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const advisorActive = useUiStore((s) => s.advisorActive);
  const language = useUiStore((s) => s.language);

  const panelRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = panelRef.current?.closest(".tab-content") as HTMLElement | null;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    Promise.all([
      apiFetch<Material[]>(`/api/v1/documents?language=${language}`, { signal: ac.signal }).catch(() => []),
      apiFetch<{ id: string; name: string }[]>("/api/v1/tags", { signal: ac.signal }).catch(() => []),
    ]).then(([docs, tags]) => {
      if (ac.signal.aborted) return;
      setMaterials(docs);
      setAllTags(tags);
      setLoading(false);
    });
    return () => { ac.abort(); setLoading(false); };
  }, [setMaterials, setLoading, setAllTags, language]);

  const filtered = useMemo(() => {
    let result = materials;

    if (scopeFilter !== "all") {
      result = result.filter((m) => m.scope?.toLowerCase() === scopeFilter.toLowerCase());
    }

    if (selectedTags.length > 0) {
      result = result.filter((m) =>
        m.tags?.some((tag) => selectedTags.includes(tag.id)),
      );
    }

    if (bookmarkFilter) {
      result = result.filter((m) => bookmarks.has(m.document_id));
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    return result;
  }, [materials, scopeFilter, selectedTags, searchQuery, bookmarkFilter, bookmarks]);

  const PAGE_SIZE = 11;
  const [page, setPage] = useState(0);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [scopeFilter, selectedTags, searchQuery, bookmarkFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages]);

  return (
    <div className="workspace-panel" ref={panelRef}>
      {/* Scope filter — standalone above toolbar */}
      <ScopeBar />

      {/* Toolbar: search + advisor toggle + view */}
      <div className="materials-toolbar">
        <div className="toolbar-top-row">
          <AdvisorToggle />
          <div className="toolbar-right">
            <button
              className={`bookmark-filter-btn${bookmarkFilter ? " active" : ""}`}
              onClick={() => setBookmarkFilter(!bookmarkFilter)}
              aria-pressed={bookmarkFilter}
              title={t("bookmark_filter", "Избранное")}
            >
              <Icon name="bookmark" size={16} />
            </button>
            <div className="view-toggle">
              <button
                className={`view-toggle-btn${viewMode === "grid" ? " active" : ""}`}
                onClick={() => setViewMode("grid")}
                title={t("view_grid", "Сетка")}
              >
                <Icon name="layout-grid" size={16} />
              </button>
              <button
                className={`view-toggle-btn${viewMode === "list" ? " active" : ""}`}
                onClick={() => setViewMode("list")}
                title={t("view_list", "Список")}
              >
                <Icon name="list" size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="toolbar-search-row">
          <SearchBar />
        </div>
      </div>

      {/* Tags + Grid + Pagination — hidden when advisor is answering */}
      {!advisorActive && (
        <>
          <TagFilterBar />

          <div className="materials-count">
            <span>{t("materials_meta_total", { count: filtered.length })}</span>
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={goPrev}
                  disabled={page === 0}
                  aria-label={t("prev_page", "Предыдущая")}
                >
                  <Icon name="chevron-left" size={14} />
                </button>
                <span className="pagination-info">{page + 1} / {totalPages}</span>
                <button
                  className="pagination-btn"
                  onClick={goNext}
                  disabled={page >= totalPages - 1}
                  aria-label={t("next_page", "Следующая")}
                >
                  <Icon name="chevron-right" size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="materials-content">
            {isLoading && materials.length === 0 ? (
              <MaterialGridSkeleton count={6} />
            ) : (
              <MaterialsGrid materials={paged} />
            )}
          </div>
        </>
      )}

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={() => panelRef.current?.closest(".tab-content")?.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <Icon name="chevron-up" size={20} />
        </button>
      )}
    </div>
  );
}
