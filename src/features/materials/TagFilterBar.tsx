import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore } from "../../stores/materials";
import { Icon } from "../../components/Icon";

const COLLAPSED_COUNT = 10;

export function TagFilterBar() {
  const { t } = useTranslation();
  const allTags = useMaterialsStore((s) => s.allTags);
  const selectedTags = useMaterialsStore((s) => s.selectedTags);
  const setSelectedTags = useMaterialsStore((s) => s.setSelectedTags);
  const [expanded, setExpanded] = useState(false);

  if (allTags.length === 0) return null;

  const toggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const sorted = [...allTags].sort((a, b) => {
    const aActive = selectedTags.includes(a.id) ? 0 : 1;
    const bActive = selectedTags.includes(b.id) ? 0 : 1;
    return aActive - bActive;
  });

  const visible = expanded ? sorted : sorted.slice(0, COLLAPSED_COUNT);
  const hiddenCount = sorted.length - COLLAPSED_COUNT;

  return (
    <div className="tag-filter-wrap">
      <div className="tag-wrap-row">
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            className="tag-clear-btn"
            aria-label={t("tag_filter_clear", "Сбросить")}
          >
            <Icon name="x" size={12} />
            {t("tag_filter_clear", "Сбросить")}
          </button>
        )}
        {visible.map((tag) => {
          const active = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggle(tag.id)}
              className={`tag-pill${active ? " active" : ""}`}
              aria-pressed={active}
            >
              {tag.name}
            </button>
          );
        })}
        {!expanded && hiddenCount > 0 && (
          <button
            className="tag-pill tag-pill-more"
            onClick={() => setExpanded(true)}
          >
            +{hiddenCount}
          </button>
        )}
        {expanded && hiddenCount > 0 && (
          <button
            className="tag-pill tag-pill-more"
            onClick={() => setExpanded(false)}
          >
            <Icon name="chevron-up" size={12} />
            {t("tag_filter_collapse", "Свернуть")}
          </button>
        )}
      </div>
    </div>
  );
}
