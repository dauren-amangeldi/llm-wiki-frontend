import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

const STORAGE_KEY = "onboarding-completed";

const STEPS = [
  { targetSelector: ".workspace-tab[aria-selected='true']", titleKey: "onboard_dashboard_title", descKey: "onboard_dashboard_desc", position: "bottom" as const },
  { targetSelector: ".dashboard-hero-search", titleKey: "onboard_search_title", descKey: "onboard_search_desc", position: "bottom" as const },
  { targetSelector: ".workspace-tab:nth-child(2)", titleKey: "onboard_materials_title", descKey: "onboard_materials_desc", position: "bottom" as const },
  { targetSelector: ".workspace-tab:nth-child(4)", titleKey: "onboard_guidelines_title", descKey: "onboard_guidelines_desc", position: "bottom" as const },
  { targetSelector: ".workspace-actions", titleKey: "onboard_actions_title", descKey: "onboard_actions_desc", position: "left" as const },
];

/** Call this to re-show onboarding */
export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("onboarding-reset"));
}

export function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(-1);

  const start = useCallback(() => {
    setTimeout(() => setStep(0), 1200);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      start();
    }
    const handler = () => start();
    window.addEventListener("onboarding-reset", handler);
    return () => window.removeEventListener("onboarding-reset", handler);
  }, [start]);

  if (step < 0 || step >= STEPS.length) return null;

  const current = STEPS[step];
  const target = document.querySelector(current.targetSelector);
  if (!target) {
    // Skip missing targets — delay to avoid render loop
    setTimeout(() => setStep((s) => s + 1), 100);
    return null;
  }

  const rect = target.getBoundingClientRect();

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10000,
  };

  if (current.position === "bottom") {
    tooltipStyle.top = rect.bottom + 12;
    tooltipStyle.left = Math.max(160, Math.min(rect.left + rect.width / 2, window.innerWidth - 160));
    tooltipStyle.transform = "translateX(-50%)";
  } else if (current.position === "left") {
    tooltipStyle.top = rect.top + rect.height / 2;
    tooltipStyle.right = window.innerWidth - rect.left + 12;
    tooltipStyle.transform = "translateY(-50%)";
  }

  function handleNext() {
    if (step >= STEPS.length - 1) {
      localStorage.setItem(STORAGE_KEY, "true");
      setStep(-1);
    } else {
      setStep(step + 1);
    }
  }

  function handleSkip() {
    localStorage.setItem(STORAGE_KEY, "true");
    setStep(-1);
  }

  return (
    <>
      <div className="onboarding-overlay" onClick={handleSkip} />
      <div className="onboarding-spotlight" style={{
        position: "fixed",
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        borderRadius: 12,
        zIndex: 9999,
      }} />
      <div className="onboarding-tooltip" style={tooltipStyle}>
        <div className="onboarding-tooltip-header">
          <span className="onboarding-step-badge">{step + 1}/{STEPS.length}</span>
          <button className="onboarding-skip" onClick={handleSkip}><Icon name="x" size={14} /></button>
        </div>
        <h4>{t(current.titleKey)}</h4>
        <p>{t(current.descKey)}</p>
        <button className="btn btn-primary btn-sm onboarding-next" onClick={handleNext}>
          {step >= STEPS.length - 1 ? t("onboard_done", "Готово") : t("onboard_next", "Далее")}
        </button>
      </div>
    </>
  );
}
