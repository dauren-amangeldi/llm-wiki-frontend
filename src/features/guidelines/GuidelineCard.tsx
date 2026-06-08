import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { SectionBlock } from "./SectionBlock";

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

function resolveColor(color: string): string {
  return color.startsWith("--") || color.startsWith("var(")
    ? `var(--${color.replace(/^(var\(--|--)/, "").replace(/\)$/, "")})`
    : `var(--${color})`;
}

function EmptyCircle({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function GuidelineCard({ card, isRead, isOpen, onToggle, onToggleRead }: {
  card: GuideCard;
  isRead: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onToggleRead: (id: string) => void;
}) {
  const { t } = useTranslation();
  const color = resolveColor(card.color);

  return (
    <div
      className={`guide-card${isRead ? " guide-card--read" : ""}${isOpen ? " guide-card--open" : ""}`}
      style={{ "--guide-color": color } as React.CSSProperties}
    >
      <div
        className="guide-card-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      >
        <div className="guide-card-icon" style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
          <Icon name={card.icon} size={18} />
        </div>
        <div className="guide-card-meta">
          <h3 className="guide-card-title">{card.title}</h3>
        </div>
        <span className="guide-card-count">
          {card.sections.length} {t("guide_sections", "разделов")}
        </span>
        <button
          type="button"
          className={`guide-read-btn${isRead ? " guide-read-btn--active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleRead(card.id); }}
          aria-label={isRead ? t("guide_mark_unread") : t("guide_mark_read")}
        >
          {isRead ? <Icon name="check-circle" size={16} /> : <EmptyCircle size={16} />}
        </button>
        <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={14} className="guide-card-chevron" />
      </div>
      {isOpen && (
        <div className="guide-card-sections">
          {card.sections.map((s, i) => (
            <SectionBlock key={s.title} section={s} defaultExpanded={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
