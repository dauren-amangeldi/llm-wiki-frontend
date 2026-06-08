import { useState, useCallback } from "react";
import { useModalStore } from "../../stores/modal";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";
import { useToastStore } from "../../components/Toast";
import { Icon } from "../../components/Icon";
import { DropZone } from "./DropZone";
import { NotesBlock } from "./NotesBlock";
import { MaterialTagBar } from "./MaterialTagBar";
import { contentTypeIcon } from "../../lib/icons";

interface SourcesColumnProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function SourcesColumn({ collapsed, onToggle }: SourcesColumnProps) {
  const { t } = useTranslation();
  const sources = useModalStore((s) => s.sources);
  const material = useModalStore((s) => s.material);
  const documentTags = useModalStore((s) => s.documentTags);
  const tagSuggestions = useModalStore((s) => s.tagSuggestions);
  const setDocumentTags = useModalStore((s) => s.setDocumentTags);
  const setTagSuggestions = useModalStore((s) => s.setTagSuggestions);
  const setSources = useModalStore((s) => s.setSources);
  const language = useUiStore((s) => s.language);
  const toast = useToastStore();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [uploadCount, setUploadCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [error, setError] = useState("");

  const handleTagsChange = useCallback(
    (newTags: { id: string; name: string }[], newSuggestions: { id: string; name: string }[]) => {
      setDocumentTags(newTags);
      setTagSuggestions(newSuggestions);
    },
    [setDocumentTags, setTagSuggestions],
  );

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!material || files.length === 0) return;
      setUploading(true);
      setUploadCount(files.length);
      setCompletedCount(0);
      setError("");

      const newSources: { title: string; content_type: string; path?: string; status?: string }[] = [];
      let failed = 0;

      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round(((i) / files.length) * 100));
        try {
          const formData = new FormData();
          formData.append("file", files[i]);
          // Attach to existing topic (case) so file gets vectorized and linked
          const topicId = material.topic_ids?.[0];
          if (topicId) {
            formData.append("topic_id", topicId);
          } else {
            formData.append("topic_title", material.title);
          }

          const result = await apiFetch<{ title: string; content_type: string; path?: string }>(
            "/api/v1/uploads",
            { method: "POST", body: formData },
          );
          newSources.push({ title: result.title, content_type: result.content_type, path: result.path, status: "processing" });
          setCompletedCount((c) => c + 1);
        } catch (err) {
          import.meta.env.DEV && console.error("Upload failed for", files[i].name, err);
          failed++;
        }
      }

      if (newSources.length > 0) {
        const current = useModalStore.getState().sources;
        setSources([...current, ...newSources]);
        toast.show(
          files.length === 1
            ? t("upload_success", "Файл загружен")
            : t("upload_success_multi", "{{count}} файлов загружено", { count: newSources.length }),
          "success",
        );
      }
      if (failed > 0) {
        setError(t("upload_error_partial", "Не удалось загрузить {{count}} файлов", { count: failed }));
      }

      setUploading(false);
      setProgress(undefined);
      setUploadCount(0);
    },
    [material, setSources, toast, t],
  );

  const handleDeleteSource = useCallback(
    async (index: number) => {
      const src = sources[index];
      // If source has a document_id, try to unlink from topic on the server
      if (src && (src as { document_id?: string }).document_id && material?.topic_ids?.[0]) {
        try {
          await apiFetch(`/api/v1/topics/${material.topic_ids[0]}/documents/${(src as { document_id?: string }).document_id}`, { method: "DELETE" });
        } catch {
          // Server-side unlink not available yet — remove locally only
        }
      }
      const current = useModalStore.getState().sources;
      setSources(current.filter((_, i) => i !== index));
    },
    [sources, material, setSources],
  );

  if (collapsed) {
    return (
      <div className="modal-column sources-column is-collapsed">
        <button className="panel-expand-btn" onClick={onToggle} title={t("expand_panel", "Развернуть")}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="modal-column sources-column">
      <div className="modal-column-head">
        <h3>{t("modal_sources_title")}</h3>
        {onToggle && (
          <button className="panel-collapse-btn" onClick={onToggle} title={t("collapse_panel", "Свернуть")}>
            <Icon name="chevron-left" size={16} />
          </button>
        )}
      </div>

      {/* Document info card */}
      {material && (
        <div className="source-info-card">
          {material.status && (
            <div className="source-info-row">
              <Icon name="activity" size={14} />
              <span className="source-info-label">{t("info_status", "Статус")}</span>
              <span className={`status-badge status-${material.status.toLowerCase()}`}>
                {t(`status_${material.status.toLowerCase()}`, material.status)}
              </span>
            </div>
          )}
          {material.created_at && (
            <div className="source-info-row">
              <Icon name="calendar" size={14} />
              <span className="source-info-label">{t("info_date", "Дата")}</span>
              <span className="source-info-value">
                {new Date(material.created_at).toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}
          {material.scope && (
            <div className="source-info-row">
              <Icon name="globe" size={14} />
              <span className="source-info-label">{t("info_scope", "Scope")}</span>
              <span className="source-info-value">{t(`scope_${material.scope}`, material.scope)}</span>
            </div>
          )}
          {(documentTags.length > 0 || tagSuggestions.length > 0) && (
            <div className="source-info-tags">
              <div className="source-info-row">
                <Icon name="tag" size={14} />
                <span className="source-info-label">{t("info_tags", "Теги")}</span>
              </div>
              <MaterialTagBar
                documentId={material.document_id}
                tags={documentTags}
                suggestions={tagSuggestions}
                onTagsChange={handleTagsChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      <DropZone onFilesSelected={handleFilesSelected} uploading={uploading} progress={progress} uploadCount={uploadCount} completedCount={completedCount} />

      {error && (
        <p className="sources-error">{error}</p>
      )}

      {/* Source list with delete */}
      {sources.length > 0 && (
        <div className="sources-list">
          <div className="sources-list-header">
            <span>{t("sources_loaded", "Загруженные источники")}</span>
            <span className="sources-list-count">{sources.length}</span>
          </div>
          {sources.map((src, i) => (
            <div key={`${src.title}-${src.content_type}-${i}`} className={`source-list-item${(src as { status?: string }).status === "processing" ? " is-processing" : ""}`}>
              <Icon name={contentTypeIcon(src.content_type)} size={14} />
              <span className="source-list-item-name" title={src.title}>{src.title}</span>
              {(src as { status?: string }).status === "processing" ? (
                <span className="source-processing-badge">
                  <Icon name="loader" size={12} className="animate-spin" />
                  {t("vectorizing", "Векторизация...")}
                </span>
              ) : (
                <button
                  className="source-list-delete"
                  onClick={() => handleDeleteSource(i)}
                  aria-label={t("delete", "Удалить")}
                >
                  <Icon name="trash-2" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {sources.length === 0 && !uploading && (
        <p className="sources-empty">
          {t("no_sources", "Нет источников")}
        </p>
      )}

      {material && <NotesBlock documentId={material.document_id} />}
    </div>
  );
}

