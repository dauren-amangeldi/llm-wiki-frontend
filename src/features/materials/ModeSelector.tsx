import { useTranslation } from "react-i18next";
import { useUiStore } from "../../stores/ui";
import { Icon } from "../../components/Icon";

const MODES = [
  { key: "library" as const, icon: "book-open", i18n: "mode_library", descI18n: "mode_library_desc" },
  { key: "expert" as const, icon: "lightbulb", i18n: "mode_expert", descI18n: "mode_expert_desc" },
  { key: "advisor" as const, icon: "message-circle", i18n: "mode_advisor", descI18n: "mode_advisor_desc" },
];

export function ModeSelector() {
  const { t } = useTranslation();
  const mode = useUiStore((s) => s.mode);
  const setMode = useUiStore((s) => s.setMode);

  return (
    <div className="mode-selector" role="group" aria-label="Mode selector">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          className={`mode-btn${mode === m.key ? " active" : ""}`}
          title={t(m.descI18n)}
        >
          <Icon name={m.icon} size={16} />
          {t(m.i18n)}
        </button>
      ))}
    </div>
  );
}
