import { useState, useCallback, useEffect } from "react";
import { useModalStore } from "../../stores/modal";
import { useUiStore } from "../../stores/ui";
import { useArtifactStore } from "../studio/ArtifactViewer";
import { apiFetch } from "../../api/client";
import { useToastStore } from "../../components/Toast";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { STUDIO_ITEMS } from "../../lib/constants";
import { QuoteWidget } from "./QuoteWidget";
import { StudioArtifactCard } from "./StudioArtifactCard";

interface StudioResponse {
  kind: string;
  content: unknown;
  job_id?: string;
  artifact_id?: string;
  audio_url?: string;
  transcript?: { speaker: string; text: string }[];
  chapters?: { title: string; speaker: string }[];
  url?: string;
}

interface ExistingArtifact {
  artifact_id: string;
  kind: string;
  status: string;
  created_at: string;
}

/** Map studio item key to artifact kind (e.g. "cards" → "card"). */
function toArtifactKind(key: string): string {
  return key === "cards" ? "card" : key;
}

interface StudioColumnProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function StudioColumn({ collapsed, onToggle }: StudioColumnProps) {
  const { t } = useTranslation();
  const material = useModalStore((s) => s.material);
  const language = useUiStore((s) => s.language);
  const openArtifact = useArtifactStore((s) => s.openArtifact);
  const toast = useToastStore();

  const [loadingKind, setLoadingKind] = useState<string | null>(null);
  const [existing, setExisting] = useState<Map<string, ExistingArtifact>>(new Map());

  const refreshArtifacts = useCallback(
    (signal?: AbortSignal) => {
      if (!material) return;
      apiFetch<ExistingArtifact[]>(
        `/api/v1/artifacts?document_id=${material.document_id}`,
        signal ? { signal } : undefined,
      )
        .then((list) => {
          if (signal?.aborted) return;
          const map = new Map<string, ExistingArtifact>();
          for (const a of list) map.set(a.kind, a);
          setExisting(map);
        })
        .catch(() => {});
    },
    [material],
  );

  // Load existing artifacts when material changes
  useEffect(() => {
    const ac = new AbortController();
    refreshArtifacts(ac.signal);
    return () => { ac.abort(); };
  }, [refreshArtifacts]);

  const openExisting = useCallback(
    async (artifact: ExistingArtifact) => {
      setLoadingKind(artifact.kind);
      try {
        const data = await apiFetch<{
          artifact_id: string;
          kind: string;
          versions: { language: string; content: unknown }[];
        }>(`/api/v1/artifacts/${artifact.artifact_id}?language=${language}`);
        const version = data.versions.find((v) => v.language === language) || data.versions[0];
        if (version) {
          openArtifact(data.artifact_id, data.kind, version.content);
        } else {
          toast.show(t("no_content", "Контент не найден"), "error");
        }
      } catch {
        toast.show(t("studio_error", "Не удалось загрузить"), "error");
      } finally {
        setLoadingKind(null);
      }
    },
    [language, openArtifact, toast, t],
  );

  const handleGenerate = useCallback(
    async (kind: string) => {
      if (!material) return;
      setLoadingKind(kind);
      try {
        let res: StudioResponse;

        if (kind === "cards") {
          const cardRes = await apiFetch<StudioResponse>("/api/v1/cards/generate", {
            method: "POST",
            body: JSON.stringify({ document_id: material.document_id, languages: [language] }),
          });
          // Fetch the generated card content
          const cardId = cardRes.artifact_id || (cardRes as unknown as { card_id?: string }).card_id;
          if (cardId) {
            const detail = await apiFetch<{
              artifact_id: string; kind: string;
              versions: { language: string; content: unknown }[];
            }>(`/api/v1/artifacts/${cardId}?language=${language}`);
            const ver = detail.versions.find((v) => v.language === language) || detail.versions[0];
            res = { kind: "card", content: ver?.content, artifact_id: cardId };
          } else {
            res = { kind: "card", content: cardRes.content, artifact_id: cardRes.artifact_id };
          }
        } else if (kind === "podcast") {
          const cardRes = await apiFetch<{ card_id?: string; artifact_id?: string }>(
            "/api/v1/cards/generate",
            {
              method: "POST",
              body: JSON.stringify({ document_id: material.document_id, languages: [language] }),
            },
          );
          const artifactId = cardRes.artifact_id || cardRes.card_id;
          if (!artifactId) throw new Error("Card generation failed");
          res = await apiFetch<StudioResponse>("/api/v1/speech/podcast", {
            method: "POST",
            body: JSON.stringify({ artifact_id: artifactId, language }),
          });
          res.kind = "podcast";
          res.content = { audio_url: res.audio_url, transcript: res.transcript, chapters: res.chapters };
        } else if (kind === "infographic") {
          const imgRes = await apiFetch<{ url?: string; artifact_id?: string }>(
            "/api/v1/images/generate",
            {
              method: "POST",
              body: JSON.stringify({
                document_id: material.document_id,
                language,
                title: material.title,
              }),
            },
          );
          res = {
            kind: "infographic",
            content: { image_url: imgRes.url },
            artifact_id: imgRes.artifact_id,
          };
        } else {
          res = await apiFetch<StudioResponse>("/api/v1/studio/generate", {
            method: "POST",
            body: JSON.stringify({ kind, document_id: material.document_id, language }),
          });
        }

        openArtifact(
          res.artifact_id || res.job_id || kind,
          res.kind || kind,
          res.content,
        );

        refreshArtifacts();

      } catch (err) {
        import.meta.env.DEV && console.error("Studio generate failed", err);
        toast.show(t("studio_error", "Не удалось сгенерировать"), "error");
      } finally {
        setLoadingKind(null);
      }
    },
    [material, language, openArtifact, toast, t, refreshArtifacts],
  );

  const handleClick = useCallback(
    (kind: string) => {
      const artifactKind = toArtifactKind(kind);
      const ex = existing.get(artifactKind);
      if (ex) {
        openExisting(ex);
      } else {
        handleGenerate(kind);
      }
    },
    [existing, openExisting, handleGenerate],
  );

  if (collapsed) {
    return (
      <div className="modal-column studio-column is-collapsed">
        <button className="panel-expand-btn" onClick={onToggle} title={t("expand_panel", "Развернуть")}>
          <Icon name="chevron-left" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="modal-column studio-column">
      <div className="modal-column-head">
        <h3>{t("studio_title", "Агенты")}</h3>
        {onToggle && (
          <button className="panel-collapse-btn" onClick={onToggle} title={t("collapse_panel", "Свернуть")}>
            <Icon name="chevron-right" size={16} />
          </button>
        )}
      </div>

      <div className="studio-scroll-body">
        <div className="studio-grid">
          {STUDIO_ITEMS.map((item) => {
            const artifactKind = toArtifactKind(item.key);
            const hasExisting = existing.has(artifactKind);
            return (
              <StudioArtifactCard
                key={item.key}
                itemKey={item.key}
                icon={item.icon}
                label={item.label}
                loading={loadingKind === item.key}
                disabled={loadingKind !== null}
                hasExisting={hasExisting}
                onClick={(e) => e.shiftKey ? handleGenerate(item.key) : handleClick(item.key)}
              />
            );
          })}
        </div>

        {loadingKind && (
          <div className="generation-progress">
            <div className="generation-progress-header">
              <span className="generation-progress-label">{t("generating", "Генерация...")}</span>
              <span className="generation-progress-step">{t("please_wait", "подождите")}</span>
            </div>
            <div className="generation-progress-bar">
              <div className="generation-progress-fill generation-progress-indeterminate" />
            </div>
          </div>
        )}

        {Array.from(existing.values()).length > 0 && (
          <p className="studio-hint">
            <Icon name="info" size={14} />
            {t("studio_hint_existing", "Нажмите для просмотра. Зажмите Shift для перегенерации.")}
          </p>
        )}
      </div>
      <QuoteWidget />
    </div>
  );
}
