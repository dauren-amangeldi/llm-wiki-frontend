import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

interface SectionTipProps {
  /** Unique key for localStorage, e.g. "tip-materials" */
  storageKey: string;
  /** i18n key for the tip text */
  textKey: string;
  /** Fallback text */
  fallback: string;
  /** Icon name (lucide) */
  icon?: string;
}

export function SectionTip({ storageKey, textKey, fallback, icon = "lightbulb" }: SectionTipProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(storageKey, "true");
    setVisible(false);
  }

  return (
    <div className="section-tip">
      <Icon name={icon} size={16} />
      <span>{t(textKey, fallback)}</span>
      <button className="section-tip-close" onClick={dismiss} aria-label="Close">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
