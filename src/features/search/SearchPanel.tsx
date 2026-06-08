import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../hooks/useDebounce";
import { apiFetch } from "../../api/client";
import { useUiStore } from "../../stores/ui";
import { useModalStore } from "../../stores/modal";
import { Icon } from "../../components/Icon";
import { VoiceButton } from "../../components/VoiceButton";
import { EmptyState } from "../../components/EmptyState";
import { SearchResultItem } from "./SearchResultItem";
import type { Material } from "../../stores/materials";

type Scope = "all" | "documents";

/** Raw shape returned by GET /api/v1/search */
interface SearchResultRaw {
  document_id: string | null;
  document_title: string;
  snippet: string;
  scope: string;
  classification: string;
  score: number;
  content_type?: string;
  topic_id?: string | null;
  tags?: string[];
}

/** Normalize backend SearchResult into Material-compatible shape for display + modal */
function normalizeResult(r: SearchResultRaw): Material | null {
  if (!r.document_id) return null;
  return {
    document_id: r.document_id,
    title: r.document_title,
    content_type: r.content_type || "document",
    scope: r.scope,
    business_unit: "",
    status: "indexed",
    created_at: "",
    snippet: r.snippet,
    classification: r.classification,
  };
}

const RECENT_KEY = "bi_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function saveRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

interface SearchPanelProps {
  onClose: () => void;
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);
  const openModal = useModalStore((s) => s.openModal);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [results, setResults] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setSearched(false); return; }
    const ac = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ q: debouncedQuery, scope, language });
    apiFetch<SearchResultRaw[]>(`/api/v1/search?${params}`, { signal: ac.signal })
      .then((data) => {
        if (!ac.signal.aborted) {
          const normalized = (data ?? []).map(normalizeResult).filter((r): r is Material => r !== null);
          setResults(normalized);
          setSearched(true);
          setSelectedIdx(0);
          if (normalized.length > 0) saveRecentSearch(debouncedQuery.trim());
        }
      })
      .catch((err) => { if (err?.name === "AbortError") return; if (!ac.signal.aborted) { setResults([]); setSearched(true); } })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => { ac.abort(); };
  }, [debouncedQuery, scope, language]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIdx]) { e.preventDefault(); openModal(results[selectedIdx]); onClose(); }
  }, [results, selectedIdx, openModal, onClose]);

  const scopes: { value: Scope; label: string }[] = [
    { value: "all", label: t("search.scopeAll", "All") },
    { value: "documents", label: t("search.scopeDocuments", "Documents") },
  ];

  return (
    <div className="search-panel" onKeyDown={handleKeyDown}>
      <div className="search-panel-input-wrap">
        <span className="field-icon"><Icon name="search" size={16} /></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder", "Search documents...")}
          className="search-panel-input"
        />
        <VoiceButton onTranscript={(text) => setQuery(text)} mode="single" />
      </div>

      <div className="search-scope-bar">
        {scopes.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setScope(s.value)}
            className={`search-scope-chip${scope === s.value ? " active" : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="search-results">
        {/* Recent searches — show when query is empty */}
        {!query.trim() && !searched && (() => {
          const recent = getRecentSearches();
          return recent.length > 0 ? (
            <div className="search-recent">
              <div className="search-recent-header">
                <Icon name="clock" size={14} />
                <span>{t("recent_searches", "Recent searches")}</span>
              </div>
              {recent.map((q) => (
                <button key={q} type="button" className="search-recent-item" onClick={() => setQuery(q)}>
                  <Icon name="search" size={14} />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          ) : null;
        })()}

        {loading && (
          <div className="loading-center">
            <Icon name="loader" size={20} className="animate-spin" />
          </div>
        )}
        {!loading && searched && results.length === 0 && (
          <EmptyState icon="search-x" titleKey="empty_results_title" descKey="empty_results_desc" />
        )}
        {!loading && results.map((item, idx) => (
          <SearchResultItem
            key={item.document_id}
            item={item}
            selected={idx === selectedIdx}
            onClick={() => { openModal(item); onClose(); }}
          />
        ))}
      </div>
    </div>
  );
}
