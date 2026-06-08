import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

interface HistoryEntry {
  id: string;
  label: string;
  time: string;
}

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem("bi_history");
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function HistoryMenu() {
  const { t } = useTranslation();
  const entries = readHistory();

  return (
    <div className="dropdown-menu" style={{ minWidth: 280 }}>
      <div className="dropdown-header">{t("history_button")}</div>
      {entries.length === 0 ? (
        <div className="dropdown-empty">{t("history_empty")}</div>
      ) : (
        <div style={{ maxHeight: 256, overflowY: "auto" }}>
          {entries.map((entry) => (
            <button key={entry.id} className="dropdown-item">
              <Icon name="clock" size={14} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.label}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                {entry.time}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
