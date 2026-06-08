import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore } from "../../stores/materials";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";

interface CompareResult {
  comparison: {
    similarities: string[];
    differences: string[];
    summary: string;
    recommendation: string;
  };
}

export function BulkActionBar() {
  const { t } = useTranslation();
  const selectedIds = useMaterialsStore((s) => s.selectedIds);
  const clearSelection = useMaterialsStore((s) => s.clearSelection);
  const language = useUiStore((s) => s.language);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);

  if (selectedIds.size === 0 && !compareResult) return null;

  const canCompare = selectedIds.size === 2;

  async function handleCompare() {
    if (!canCompare) return;
    setComparing(true);
    try {
      const result = await apiFetch<CompareResult>("/api/v1/studio/compare", {
        method: "POST",
        body: JSON.stringify({ document_ids: [...selectedIds], language }),
      });
      setCompareResult(result);
    } catch (err) {
      import.meta.env.DEV && console.error("Compare failed", err);
    } finally {
      setComparing(false);
    }
  }

  if (compareResult) {
    const c = compareResult.comparison;
    return (
      <div className="compare-result-panel">
        <div className="compare-result-header">
          <h3>{t("compare_title", "Сравнение материалов")}</h3>
          <button className="icon-button" onClick={() => { setCompareResult(null); clearSelection(); }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="compare-result-body">
          {c.summary && <p className="compare-summary">{c.summary}</p>}
          <div className="compare-columns">
            <div className="compare-col">
              <h4><Icon name="circle-check" size={14} /> {t("compare_similarities", "Сходства")}</h4>
              <ul>{c.similarities?.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div className="compare-col">
              <h4><Icon name="git-branch" size={14} /> {t("compare_differences", "Различия")}</h4>
              <ul>{c.differences?.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </div>
          {c.recommendation && (
            <div className="compare-recommendation">
              <Icon name="lightbulb" size={14} />
              <span>{c.recommendation}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bulk-action-bar">
      <span className="bulk-count">
        {t("bulk_selected", { n: selectedIds.size, defaultValue: "{{n}} выбрано" })}
      </span>
      <div className="bulk-actions">
        {canCompare && (
          <button
            className="bulk-btn"
            onClick={handleCompare}
            disabled={comparing}
            title={t("compare_btn", "Сравнить")}
          >
            {comparing ? (
              <Icon name="loader" size={16} className="animate-spin" />
            ) : (
              <Icon name="git-compare" size={16} />
            )}
            {t("compare_btn", "Сравнить")}
          </button>
        )}
        <button
          className="bulk-btn bulk-btn-cancel"
          onClick={clearSelection}
        >
          <Icon name="x" size={16} />
          {t("cancel", "Отмена")}
        </button>
      </div>
    </div>
  );
}
