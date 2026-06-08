import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore, type Material } from "../../stores/materials";
import { useModalStore } from "../../stores/modal";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { useToastStore } from "../../components/Toast";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { relativeTime } from "../../lib/format";
import { contentTypeIcon } from "../../lib/icons";

/* 7 distinct hues for topic-based left border */
const TOPIC_HUES = [210, 150, 340, 30, 270, 180, 50];
function topicHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return TOPIC_HUES[Math.abs(h) % TOPIC_HUES.length];
}

interface MaterialCardProps {
  material: Material;
}

export const MaterialCard = memo(function MaterialCard({ material }: MaterialCardProps) {
  const { t } = useTranslation();
  const openModal = useModalStore((s) => s.openModal);
  const language = useUiStore((s) => s.language);
  const bookmarks = useMaterialsStore((s) => s.bookmarks);
  const toggleBookmark = useMaterialsStore((s) => s.toggleBookmark);
  const setMaterials = useMaterialsStore((s) => s.setMaterials);
  const toast = useToastStore();
  const isBookmarked = bookmarks.has(material.document_id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const iconName = contentTypeIcon(material.content_type);
  const statusKey = `status_${(material.status || "").toLowerCase()}` as const;
  const localizedTitle = material.title_i18n?.[language] || material.title;
  const hue = useMemo(() => topicHue(material.topic_ids?.[0] || material.document_id), [material.topic_ids, material.document_id]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { if (!confirmDelete) openModal(material); }}
      onKeyDown={(e) => { if (!confirmDelete && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(material); } }}
      className={`material-card${material.status === "error" ? " is-error" : ""}`}
      data-scope={material.scope}
      data-ctype={material.content_type?.toLowerCase()}
      style={{ "--_topic-hue": hue } as React.CSSProperties}
    >
      {/* Head: icon + title inline */}
      <div className="material-card-head">
        <div className="material-card-icon" data-type={material.content_type?.toLowerCase()}>
          <Icon name={iconName} size={16} />
        </div>
        <h3 className="material-title" title={localizedTitle}>{localizedTitle}</h3>
      </div>

      {/* Summary — 3 lines, CSS handles ellipsis */}
      {typeof material.cardSummary?.summary === "string" && (
        <p className="material-summary">{material.cardSummary.summary}</p>
      )}

      {/* Tags */}
      {material.tags && material.tags.length > 0 && (
        <div className="tag-pills">
          {material.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} label={tag.name} />
          ))}
          {material.tags.length > 2 && (
            <Badge key="__more" label={`+${material.tags.length - 2}`} />
          )}
        </div>
      )}

      {/* Footer: status + date + actions */}
      <div className="material-card-footer">
        <span className={`status-badge status-${(material.status || "").toLowerCase()}`}>
          {t(statusKey)}
        </span>
        <span className="meta-row">{relativeTime(material.created_at, language)}</span>
        <div className="material-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`card-action-btn${isBookmarked ? " card-action-active" : ""}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(material.document_id); }}
            aria-label={isBookmarked ? t("bookmark_remove", "Убрать из избранного") : t("bookmark_add", "В избранное")}
          >
            <Icon name={isBookmarked ? "bookmark-solid" : "bookmark"} size={15} />
          </button>
          <button
            type="button"
            className="card-action-btn card-action-danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            aria-label={t("delete", "Удалить")}
          >
            <Icon name="trash-2" size={15} />
          </button>
        </div>
      </div>

      {/* Inline delete confirmation — overlays the card */}
      {confirmDelete && (
        <div className="card-confirm-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="card-confirm-icon">
            <Icon name="alert-triangle" size={28} />
          </div>
          <p className="card-confirm-title">{t("material_delete_title", "Удалить документ?")}</p>
          <p className="card-confirm-subtitle">{localizedTitle}</p>
          <div className="card-confirm-actions">
            <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(false)}>
              {t("cancel_button", "Отмена")}
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                setConfirmDelete(false);
                apiFetch(`/api/v1/documents/${material.document_id}`, { method: "DELETE" })
                  .then(() => {
                    const current = useMaterialsStore.getState().materials;
                    setMaterials(current.filter((m) => m.document_id !== material.document_id));
                    toast.show(t("material_delete_success", "Удалено"), "success");
                  })
                  .catch(() => toast.show(t("material_delete_error", "Не удалось удалить"), "error"));
              }}
            >
              <Icon name="trash-2" size={14} />
              {t("delete", "Удалить")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
