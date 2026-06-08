import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const SHORTCUTS = [
  { keys: "Cmd+K", action: "shortcuts_search" },
  { keys: "Esc", action: "shortcuts_close" },
  { keys: "?", action: "shortcuts_help" },
];

export function ShortcutsPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="shortcuts-panel" role="dialog" aria-label={t("shortcuts_title", "Keyboard shortcuts")}>
      <h4>{t("shortcuts_title", "Горячие клавиши")}</h4>
      {SHORTCUTS.map((s) => (
        <div key={s.keys} className="shortcut-row">
          <span>{t(s.action, s.action)}</span>
          <kbd>{s.keys}</kbd>
        </div>
      ))}
    </div>
  );
}
