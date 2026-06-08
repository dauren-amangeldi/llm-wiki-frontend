import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { CardSkeleton } from "../../components/Skeleton";
import { SectionTip } from "../../components/SectionTip";
import { useFetch } from "../../hooks/useFetch";
import { SectionBlock } from "./SectionBlock";

/* ── Types ── */
interface Section {
  title: string;
  body: string;
}

interface GuideCard {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  order: number;
  sections: Section[];
}

/* ── Category config ── */
const CATEGORIES: { key: string; labelKey: string; icon: string }[] = [
  { key: "all", labelKey: "guide_cat_all", icon: "grid" },
  { key: "upload", labelKey: "guide_cat_upload", icon: "upload" },
  { key: "ai", labelKey: "guide_cat_ai", icon: "sparkles" },
  { key: "cases", labelKey: "guide_cat_cases", icon: "briefcase" },
  { key: "studio", labelKey: "guide_cat_studio", icon: "cpu" },
  { key: "platform", labelKey: "guide_cat_platform", icon: "compass" },
];

/* ── localStorage read progress ── */
const STORAGE_KEY = "guidelines-read";

function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadSet(s: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));
}

/* ── Color resolver ── */
function resolveColor(color: string): string {
  return color.startsWith("--") || color.startsWith("var(")
    ? `var(--${color.replace(/^(var\(--|--)/, "").replace(/\)$/, "")})`
    : `var(--${color})`;
}

/* ── Empty circle ── */
function EmptyCircle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/* ── Progress bar ── */
function ProgressBar({ read, total }: { read: number; total: number }) {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;

  return (
    <div className="guide-progress">
      <div className="guide-progress-bar">
        <div className="guide-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="guide-progress-label">
        {t("guide_progress", "{{read}} из {{total}} прочитано", { read, total })}
      </span>
    </div>
  );
}

/* ── Main panel ── */
export function GuidelinesPanel() {
  const { t } = useTranslation();
  const { data: rawData, loading, error } = useFetch<{ cards: GuideCard[] }>("/api/v1/guidelines");
  const cards = rawData?.cards ?? [];
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [readSet, setReadSet] = useState<Set<string>>(getReadSet);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleRead = useCallback((id: string) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persistReadSet(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let result = cards;
    if (activeCategory !== "all") {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.sections.some((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
      );
    }
    return result;
  }, [cards, activeCategory, search]);

  const selectedCard = useMemo(
    () => (selectedId ? cards.find((c) => c.id === selectedId) ?? null : null),
    [selectedId, cards],
  );

  return (
    <div className="workspace-panel">
      <SectionTip
        storageKey="tip-guidelines"
        textKey="tip_guidelines"
        fallback="Интерактивная памятка поможет быстро разобраться в возможностях платформы."
        icon="book-open"
      />

      {!loading && !error && cards.length > 0 && (
        <>
          <ProgressBar read={readSet.size} total={cards.length} />
          <div className="guide-motivation">
            <Icon name={readSet.size === cards.length ? "trophy" : readSet.size > cards.length * 0.5 ? "trending-up" : "target"} size={16} />
            <span>
              {readSet.size === 0
                ? t("guide_motivation_start", "Начните изучение — впереди {{total}} памяток", { total: cards.length })
                : readSet.size < cards.length * 0.5
                ? t("guide_motivation_going", "Отлично! Осталось {{left}} памяток", { left: cards.length - readSet.size })
                : readSet.size < cards.length
                ? t("guide_motivation_almost", "Почти готово! Ещё {{left}} — и вы на 100%!", { left: cards.length - readSet.size })
                : t("guide_motivation_done", "Все памятки изучены!")}
            </span>
          </div>
        </>
      )}

      {/* Category chips */}
      <div className="guide-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`guide-cat-chip${activeCategory === cat.key ? " guide-cat-chip--active" : ""}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Icon name={cat.icon} size={14} />
            {t(cat.labelKey, cat.key === "all" ? "Все" : cat.key)}
          </button>
        ))}
      </div>

      {loading && <CardSkeleton />}
      {error && <p style={{ color: "var(--danger)", fontSize: "var(--font-sm)" }}>{error}</p>}

      {!loading && !error && (
        <div className="guide-master-detail">
          {/* Left: list */}
          <div className="guide-list">
            {/* Search inside list */}
            <div className="guide-list-search">
              <Icon name="search" size={14} />
              <input
                type="text"
                placeholder={t("guide_search_placeholder", "Поиск...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="guide-search-clear" onClick={() => setSearch("")}>
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>

            {/* Items */}
            <div className="guide-list-items">
              {filtered.length === 0 ? (
                <p className="guide-empty">{t("guide_empty", "Ничего не найдено")}</p>
              ) : (
                filtered.map((card) => {
                  const color = resolveColor(card.color);
                  const isSelected = selectedId === card.id;
                  const isRead = readSet.has(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={`guide-list-item${isSelected ? " guide-list-item--active" : ""}${isRead ? " guide-list-item--read" : ""}`}
                      onClick={() => setSelectedId(isSelected ? null : card.id)}
                    >
                      <div className="guide-list-item-icon" style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
                        <Icon name={card.icon} size={16} />
                      </div>
                      <div className="guide-list-item-text">
                        <span className="guide-list-item-title">{card.title}</span>
                        <span className="guide-list-item-count">{card.sections.length} {t("guide_sections", "разделов")}</span>
                      </div>
                      {isRead && (
                        <Icon name="check-circle" size={14} className="guide-list-item-check" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: detail */}
          <div className="guide-detail">
            {selectedCard ? (
              <>
                <div className="guide-detail-header">
                  <div className="guide-detail-icon" style={{
                    color: resolveColor(selectedCard.color),
                    background: `color-mix(in srgb, ${resolveColor(selectedCard.color)} 10%, transparent)`,
                  }}>
                    <Icon name={selectedCard.icon} size={22} />
                  </div>
                  <div className="guide-detail-title-group">
                    <h3 className="guide-detail-title">{selectedCard.title}</h3>
                    <span className="guide-detail-meta">
                      {selectedCard.sections.length} {t("guide_sections", "разделов")}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`guide-read-btn${readSet.has(selectedCard.id) ? " guide-read-btn--active" : ""}`}
                    onClick={() => toggleRead(selectedCard.id)}
                    title={readSet.has(selectedCard.id) ? t("guide_mark_unread") : t("guide_mark_read")}
                  >
                    {readSet.has(selectedCard.id) ? <Icon name="check-circle" size={18} /> : <EmptyCircle size={18} />}
                    <span>{readSet.has(selectedCard.id) ? t("guide_mark_unread", "Прочитано") : t("guide_mark_read", "Отметить")}</span>
                  </button>
                </div>
                <div className="guide-detail-sections">
                  {selectedCard.sections.map((s, i) => (
                    <SectionBlock key={s.title} section={s} defaultExpanded={i === 0} />
                  ))}
                </div>
              </>
            ) : (
              <div className="guide-detail-empty">
                <Icon name="book-open" size={40} />
                <p>{t("guide_select_hint", "Выберите памятку слева")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
