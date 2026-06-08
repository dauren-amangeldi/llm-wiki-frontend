import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Framework {
  name: string;
  description?: string;
  application?: string;
}

interface Risk {
  description: string;
  mitigation?: string;
}

interface KeyPoint {
  label: string;
  text: string;
}

interface Metric {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
}

interface CardData {
  title?: string;
  /* New demo format */
  summary?: string;
  key_points?: KeyPoint[];
  recommendations?: (string | { text: string; horizon?: string })[];
  metrics?: Metric[];
  tags?: string[];
  /* Legacy AI-generated format */
  executive_summary?: string;
  core_insight?: string;
  frameworks?: Framework[];
  risks?: (string | Risk)[];
  key_concepts?: string[];
  cards?: { front: string; back: string }[];
}

function FlashcardsView({ cards }: { cards: { front: string; back: string }[] }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  function toggle(idx: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  return (
    <div className="flashcards-grid">
      {cards.map((card, i) => (
        <button key={`card-${card.front.slice(0, 30)}`} onClick={() => toggle(i)} className="flashcard">
          <div className="flashcard-side">{flipped.has(i) ? t("answer", "Ответ") : t("question", "Вопрос")}</div>
          <p style={{ fontWeight: 500, margin: 0 }}>{flipped.has(i) ? card.back : card.front}</p>
        </button>
      ))}
    </div>
  );
}

const TREND_ICON: Record<string, string> = { up: "↑", down: "↓", stable: "→" };
const TREND_COLOR: Record<string, string> = { up: "var(--success, #22c55e)", down: "var(--danger, #ef4444)", stable: "var(--text-muted)" };

function AnalyticalCard({ data }: { data: CardData }) {
  const summaryText = data.summary || data.executive_summary;
  return (
    <div className="analytical-card">
      {data.title && <h3 style={{ margin: 0 }}>{data.title}</h3>}

      {/* Metrics row (new format) */}
      {data.metrics && data.metrics.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {data.metrics.map((m) => (
            <div key={m.label} style={{ flex: "1 1 140px", padding: "12px 16px", background: "var(--bg-accent, #f0f4ff)", borderRadius: 12, minWidth: 140 }}>
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: "var(--font-lg)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                {m.value}
                {m.trend && <span style={{ fontSize: 14, color: TREND_COLOR[m.trend] }}>{TREND_ICON[m.trend]}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {summaryText && (
        <section>
          <h4 style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: 6 }}>Резюме</h4>
          <p style={{ margin: 0, lineHeight: 1.7 }}>{summaryText}</p>
        </section>
      )}

      {/* Core insight (legacy) */}
      {data.core_insight && (
        <section style={{ padding: 16, background: "var(--bg-accent, #f0f4ff)", borderRadius: 12 }}>
          <h4 style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: 6 }}>Ключевой инсайт</h4>
          <p style={{ margin: 0, fontWeight: 500, lineHeight: 1.7 }}>{data.core_insight}</p>
        </section>
      )}

      {/* Key Points (new format) */}
      {data.key_points && data.key_points.length > 0 && (
        <section>
          <h4 style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: 8 }}>Ключевые тезисы</h4>
          {data.key_points.map((kp) => (
            <div key={kp.label} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: "3px solid var(--primary, #3b82f6)" }}>
              <strong style={{ fontSize: "var(--font-sm)" }}>{kp.label}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "var(--font-sm)", lineHeight: 1.6, color: "var(--text-secondary)" }}>{kp.text}</p>
            </div>
          ))}
        </section>
      )}

      {/* Frameworks (legacy) */}
      {data.frameworks && data.frameworks.length > 0 && (
        <section>
          <h4 style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: 8 }}>Фреймворки</h4>
          {data.frameworks.map((f) => (
            <div key={f.name} style={{ marginBottom: 8 }}>
              <strong>{f.name}</strong>
              <p style={{ margin: "4px 0 0", fontSize: "var(--font-sm)", lineHeight: 1.6 }}>{f.application || f.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Recommendations (both formats) */}
      {data.recommendations && data.recommendations.length > 0 && (
        <section>
          <h4 style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: 8 }}>Рекомендации</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {data.recommendations.map((r, i) => {
              const text = typeof r === "string" ? r : r.text;
              const horizon = typeof r === "string" ? null : r.horizon;
              return (
                <li key={`rec-${i}-${text.slice(0, 20)}`} style={{ marginBottom: 6, lineHeight: 1.6 }}>
                  {text}
                  {horizon && <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)" }}>({horizon})</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Risks (legacy) */}
      {data.risks && data.risks.length > 0 && (
        <section>
          <h4 style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", marginBottom: 8 }}>Риски</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {data.risks.map((r, i) => (
              <li key={`risk-${i}-${typeof r === "string" ? r.slice(0, 20) : r.description.slice(0, 20)}`} style={{ marginBottom: 6, lineHeight: 1.6 }}>
                {typeof r === "string" ? r : (
                  <>
                    <strong>{r.description}</strong>
                    {r.mitigation && (
                      <span style={{ display: "block", fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                        Митигация: {r.mitigation}
                      </span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tags (new format) */}
      {data.tags && data.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {data.tags.map((tag) => (
            <span key={tag} style={{ padding: "4px 10px", background: "var(--bg-accent, #f0f4ff)", borderRadius: 8, fontSize: 13 }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Key concepts (legacy) */}
      {data.key_concepts && data.key_concepts.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.key_concepts.map((c) => (
            <span key={c} style={{ padding: "4px 10px", background: "var(--bg-accent, #f0f4ff)", borderRadius: 8, fontSize: 13 }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CardsRenderer({ content }: { content: unknown }) {
  const { t } = useTranslation();
  const data = (content ?? {}) as CardData;

  if (data.cards?.length) return <FlashcardsView cards={data.cards} />;
  if (data.summary || data.executive_summary || data.core_insight || data.title || data.key_points?.length) return <AnalyticalCard data={data} />;

  return <p className="prose-muted">{t("no_cards", "Нет карточек")}</p>;
}
