import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

export function ConfidentialFooter() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="confidential-footer">
      <p className="demo-env-badge" style={{ opacity: 0.45, fontSize: "var(--font-xs, 11px)", textAlign: "center", margin: "0 0 4px", letterSpacing: "0.02em" }}>
        Demo environment &middot; demo@bi.group
      </p>
      <button
        className="confidential-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <Icon name="shield-alert" size={14} />
        <span>{t("confidential_title")}</span>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={12} />
      </button>
      {expanded && (
        <div className="confidential-body">
          <p>{t("confidential_line1")}</p>
          <p>{t("confidential_line2")}</p>
          <p>{t("confidential_line3")}</p>
        </div>
      )}
    </footer>
  );
}
