import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { STUDIO_ITEMS } from "../../lib/constants";
import { apiFetch } from "../../api/client";
import { useArtifactStore } from "./ArtifactViewer";
import { useToastStore } from "../../components/Toast";

interface StudioGridProps {
  documentId?: string;
  topicId?: string;
  language: string;
}

interface GenerateResponse {
  id: string;
  kind: string;
  content: unknown;
}

interface TemplateOptions {
  count?: string;
  difficulty?: string;
  audience?: string;
  format?: string;
}

const TEMPLATES: Record<string, { fields: { key: keyof TemplateOptions; labelKey: string; options: { value: string; labelKey: string }[] }[] }> = {
  test: {
    fields: [
      { key: "count", labelKey: "tmpl_questions", options: [
        { value: "5", labelKey: "tmpl_5" },
        { value: "10", labelKey: "tmpl_10" },
        { value: "15", labelKey: "tmpl_15" },
      ]},
      { key: "difficulty", labelKey: "tmpl_difficulty", options: [
        { value: "easy", labelKey: "tmpl_easy" },
        { value: "medium", labelKey: "tmpl_medium" },
        { value: "hard", labelKey: "tmpl_hard" },
      ]},
    ],
  },
  presentation: {
    fields: [
      { key: "count", labelKey: "tmpl_slides", options: [
        { value: "5", labelKey: "tmpl_5" },
        { value: "10", labelKey: "tmpl_10" },
        { value: "15", labelKey: "tmpl_15" },
      ]},
      { key: "audience", labelKey: "tmpl_audience", options: [
        { value: "leadership", labelKey: "tmpl_leadership" },
        { value: "team", labelKey: "tmpl_team" },
        { value: "client", labelKey: "tmpl_client" },
      ]},
    ],
  },
  report: {
    fields: [
      { key: "format", labelKey: "tmpl_format", options: [
        { value: "brief", labelKey: "tmpl_brief" },
        { value: "full", labelKey: "tmpl_full" },
      ]},
      { key: "audience", labelKey: "tmpl_audience", options: [
        { value: "leadership", labelKey: "tmpl_leadership" },
        { value: "team", labelKey: "tmpl_team" },
      ]},
    ],
  },
};

export function StudioGrid({ documentId, topicId, language }: StudioGridProps) {
  const { t } = useTranslation();
  const openArtifact = useArtifactStore((s) => s.openArtifact);
  const toast = useToastStore();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [configKey, setConfigKey] = useState<string | null>(null);
  const [options, setOptions] = useState<TemplateOptions>({});
  const [elapsed, setElapsed] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Elapsed timer during generation
  useEffect(() => {
    if (!loadingKey) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [loadingKey]);

  // Close popover on outside click
  useEffect(() => {
    if (!configKey) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setConfigKey(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [configKey]);

  async function handleGenerate(kind: string, opts: TemplateOptions = {}) {
    setLoadingKey(kind);
    setErrorKey(null);
    setConfigKey(null);
    try {
      const body: Record<string, unknown> = { kind, language, ...opts };
      if (documentId) body.document_id = documentId;
      if (topicId) body.topic_id = topicId;

      const result = await apiFetch<GenerateResponse>("/api/v1/studio/generate", {
        method: "POST",
        body: JSON.stringify(body),
      });

      openArtifact(result.id, result.kind, result.content);
      toast.show(t("studio_done", "Генерация завершена"), "success");
    } catch (err) {
      import.meta.env.DEV && console.error("Studio generation failed:", err);
      setErrorKey(kind);
    } finally {
      setLoadingKey(null);
    }
  }

  function handleClick(kind: string) {
    if (TEMPLATES[kind]) {
      if (configKey === kind) {
        // Second click or "Generate" from popover
        handleGenerate(kind, options);
      } else {
        setConfigKey(kind);
        setOptions({});
      }
    } else {
      handleGenerate(kind);
    }
  }

  return (
    <div className="studio-grid-wrap">
      {STUDIO_ITEMS.map((item) => {
        const isLoading = loadingKey === item.key;
        const isConfigOpen = configKey === item.key;
        const template = TEMPLATES[item.key];
        return (
          <div key={item.key} className="studio-grid-item" ref={isConfigOpen ? popoverRef : undefined}>
            <button
              disabled={isLoading || loadingKey !== null}
              title={loadingKey !== null && !isLoading ? t("wait_for_generation", "Дождитесь завершения") : undefined}
              onClick={() => handleClick(item.key)}
              className={`studio-grid-btn${isConfigOpen ? " studio-grid-btn--config" : ""}`}
            >
              {isLoading ? (
                <>
                  <span style={{ color: "var(--text-muted)" }}><Icon name="loader" size={24} className="animate-spin" /></span>
                  <span style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", lineHeight: 1.2 }}>
                    {t("generating_wait", "Генерируется...")}<br />{elapsed}s
                  </span>
                </>
              ) : (
                <span style={{ color: "var(--brand-cta)" }}><Icon name={item.icon} size={24} /></span>
              )}
              <span className="studio-grid-btn-label">{t(item.label)}</span>
              {template && !isConfigOpen && (
                <span className="studio-config-hint"><Icon name="settings" size={12} /></span>
              )}
              {errorKey === item.key && (
                <span style={{ fontSize: "var(--font-2xs)", color: "var(--danger, #ef4444)" }}>{t("generation_error", "Ошибка")}</span>
              )}
            </button>

            {isConfigOpen && template && (
              <div className="studio-config-popover">
                {template.fields.map((field) => (
                  <div key={field.key} className="studio-config-field">
                    <span className="studio-config-label">{t(field.labelKey, field.key)}</span>
                    <div className="studio-config-options">
                      {field.options.map((opt) => (
                        <button
                          key={opt.value}
                          className={`studio-config-chip${options[field.key] === opt.value ? " active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOptions((prev) => ({ ...prev, [field.key]: opt.value }));
                          }}
                        >
                          {t(opt.labelKey, opt.value)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  className="studio-config-generate"
                  onClick={(e) => { e.stopPropagation(); handleGenerate(item.key, options); }}
                >
                  <Icon name="sparkles" size={14} />
                  {t("generate_with_settings", "Сгенерировать")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
