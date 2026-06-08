import { useTranslation } from "react-i18next";
import { useUiStore } from "../../stores/ui";
import { useMaterialsStore } from "../../stores/materials";
import { Icon } from "../../components/Icon";

export function AdvisorToggle() {
  const { t } = useTranslation();
  const mode = useUiStore((s) => s.mode);
  const setMode = useUiStore((s) => s.setMode);
  const setAdvisorActive = useUiStore((s) => s.setAdvisorActive);
  const setSearchQuery = useMaterialsStore((s) => s.setSearchQuery);
  const isAdvisor = mode === "advisor";

  function handleToggle() {
    if (isAdvisor) {
      // Turning OFF — reset advisor state
      setMode("library");
      setAdvisorActive(false);
      setSearchQuery("");
    } else {
      setMode("advisor");
    }
  }

  return (
    <button
      className={`advisor-toggle${isAdvisor ? " active" : ""}`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isAdvisor}
      title={t("mode_advisor_desc", "Советы по всей загруженной библиотеке")}
    >
      <span className="advisor-toggle-track">
        <span className="advisor-toggle-thumb">
          <Icon name="sparkles" size={12} />
        </span>
      </span>
      <span className="advisor-toggle-label">
        {t("mode_advisor", "AI-Советник")} <span className="advisor-toggle-desc">— {t("mode_advisor_desc", "подскажет стратегию на основе опыта компании")}</span>
      </span>
    </button>
  );
}
