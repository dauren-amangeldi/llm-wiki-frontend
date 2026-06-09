import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";
import { WikiPageView } from "./WikiPageView";

interface WikiPageSummary {
  slug: string;
  title: string;
  snippet: string;
  size_chars: number;
  updated_at: string;
  backlinks_count: number;
}

export function WikiPanel() {
  const { t } = useTranslation();
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    apiFetch<WikiPageSummary[]>("/api/v1/wiki", { signal: ac.signal })
      .then((data) => { setPages(data); setLoading(false); })
      .catch(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.snippet.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q),
    );
  }, [pages, query]);

  const openSlug = (slug: string) => {
    setActiveSlug(slug);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "wiki");
    params.set("slug", slug);
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  const closeSlug = () => {
    setActiveSlug(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("slug");
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  if (activeSlug) {
    return (
      <WikiPageView
        slug={activeSlug}
        onBack={closeSlug}
        onNavigate={openSlug}
      />
    );
  }

  return (
    <div className="materials-panel">
      <div className="materials-toolbar">
        <div className="toolbar-search-row">
          <div className="search-input-wrapper">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder={t("wiki_search_placeholder", "Поиск по вики...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Icon name="layout-grid" size={16} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn${viewMode === "list" ? " active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <Icon name="list" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="materials-count">
        <span>{t("wiki_count", "{{count}} страниц", { count: filtered.length })}</span>
      </div>

      <div className="materials-content">
        {loading ? (
          <div>{t("loading", "Загрузка...")}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Icon name="book-open" size={48} />
            <h3>{t("wiki_empty_title", "Вики пуста")}</h3>
            <p>{t("wiki_empty_copy", "Загрузите файл на вкладке «Кейсы», и из него будет создана wiki-страница.")}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="materials-grid">
            {filtered.map((p) => (
              <WikiCard key={p.slug} page={p} onClick={() => openSlug(p.slug)} />
            ))}
          </div>
        ) : (
          <div className="wiki-list">
            {filtered.map((p) => (
              <WikiListItem key={p.slug} page={p} onClick={() => openSlug(p.slug)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WikiCard({ page, onClick }: { page: WikiPageSummary; onClick: () => void }) {
  return (
    <button type="button" className="material-card" onClick={onClick}>
      <div className="material-card-header">
        <Icon name="file-text" size={20} />
        <span className="material-card-title">{page.title}</span>
      </div>
      <p className="material-card-snippet">{page.snippet}</p>
      <div className="material-card-meta">
        <span>{page.size_chars} симв.</span>
        {page.backlinks_count > 0 && (
          <span><Icon name="link" size={12} /> {page.backlinks_count}</span>
        )}
      </div>
    </button>
  );
}

function WikiListItem({ page, onClick }: { page: WikiPageSummary; onClick: () => void }) {
  return (
    <button type="button" className="wiki-list-item" onClick={onClick}>
      <Icon name="file-text" size={18} />
      <div className="wiki-list-body">
        <div className="wiki-list-title">{page.title}</div>
        <div className="wiki-list-snippet">{page.snippet}</div>
      </div>
      <div className="wiki-list-meta">
        <span>{new Date(page.updated_at).toLocaleDateString()}</span>
      </div>
    </button>
  );
}
