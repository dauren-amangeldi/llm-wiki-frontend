import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore } from "../../stores/materials";

const SCOPES = [
  { key: "all", i18n: "scope_filter_all" },
  { key: "internal", i18n: "scope_filter_internal" },
  { key: "external", i18n: "scope_filter_external" },
] as const;

export function ScopeBar() {
  const { t } = useTranslation();
  const scopeFilter = useMaterialsStore((s) => s.scopeFilter);
  const setScopeFilter = useMaterialsStore((s) => s.setScopeFilter);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(".scope-toggle-btn.active");
    if (!activeBtn) return;
    setIndicatorStyle({
      width: activeBtn.offsetWidth,
      transform: `translateX(${activeBtn.offsetLeft - 3}px)`,
    });
  }, [scopeFilter, t]);

  return (
    <div className="scope-toggle" role="tablist" aria-label="Scope filter" ref={containerRef}>
      <div className="scope-toggle-indicator" style={indicatorStyle} />
      {SCOPES.map((s) => (
        <button
          key={s.key}
          role="tab"
          aria-selected={scopeFilter === s.key}
          className={`scope-toggle-btn${scopeFilter === s.key ? " active" : ""}`}
          onClick={() => setScopeFilter(s.key)}
        >
          {t(s.i18n)}
        </button>
      ))}
    </div>
  );
}
