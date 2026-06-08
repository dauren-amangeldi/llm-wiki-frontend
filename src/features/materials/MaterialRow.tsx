import { useTranslation } from "react-i18next";
import type { Material } from "../../stores/materials";
import { useMaterialsStore } from "../../stores/materials";
import { useModalStore } from "../../stores/modal";
import { useUiStore } from "../../stores/ui";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { formatDate } from "../../lib/format";

const CONTENT_TYPE_ICONS: Record<string, string> = {
  pdf: "file-text",
  document: "file-text",
  video: "video",
  audio: "headphones",
  image: "image",
  spreadsheet: "table",
  presentation: "presentation",
  link: "link",
};

interface MaterialRowProps {
  material: Material;
}

export function MaterialRow({ material }: MaterialRowProps) {
  const { t } = useTranslation();
  const openModal = useModalStore((s) => s.openModal);
  const lastViewedId = useModalStore((s) => s.lastViewedId);
  const language = useUiStore((s) => s.language);
  const selectedIds = useMaterialsStore((s) => s.selectedIds);
  const toggleSelected = useMaterialsStore((s) => s.toggleSelected);
  const isLastViewed = lastViewedId === material.document_id;
  const isSelected = selectedIds.has(material.document_id);

  const iconName =
    CONTENT_TYPE_ICONS[material.content_type?.toLowerCase()] || "file";
  const statusKey = `status_${(material.status || "").toLowerCase()}` as const;

  return (
    <div className={`material-row${isLastViewed ? " last-viewed" : ""}${isSelected ? " selected" : ""}`}>
      <label className="material-row-checkbox" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelected(material.document_id)}
        />
      </label>

      <button
        className="material-row-click"
        onClick={() => openModal(material)}
      >
        <div className="material-card-icon" data-type={material.content_type?.toLowerCase()}>
          <Icon name={iconName} size={16} />
        </div>

        <div className="material-row-body">
          <h3 className="material-title" title={material.title_i18n?.[language] || material.title}>{material.title_i18n?.[language] || material.title}</h3>
          {material.tags && material.tags.length > 0 && (
            <span className="meta-row">
              {material.tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} label={tag.name} />
              ))}
            </span>
          )}
        </div>

        <span className={`status-badge status-${(material.status || "").toLowerCase()}`}>
          {t(statusKey)}
        </span>

        <div className="meta-row">
          {formatDate(material.created_at, language)}
        </div>
      </button>
    </div>
  );
}
