import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { apiFetch } from "../../api/client";
import { useToastStore } from "../../components/Toast";

interface Tag {
  id: string;
  name: string;
}

interface MaterialTagBarProps {
  documentId: string;
  tags: Tag[];
  suggestions: Tag[];
  onTagsChange: (newTags: Tag[], newSuggestions: Tag[]) => void;
}

export function MaterialTagBar({ documentId, tags, suggestions, onTagsChange }: MaterialTagBarProps) {
  const { t } = useTranslation();
  const toast = useToastStore();
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagPickerRef = useRef<HTMLDivElement>(null);
  const tagSearchRef = useRef<HTMLInputElement>(null);

  // Close tag picker on outside click
  useEffect(() => {
    if (!showTagPicker) return;
    const onClick = (e: MouseEvent) => {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showTagPicker]);

  async function handleAddTag(tagId: string) {
    try {
      await apiFetch(`/api/v1/tags/documents/${documentId}`, {
        method: "POST",
        body: JSON.stringify({ tag_ids: [tagId] }),
      });
      const added = suggestions.find((t) => t.id === tagId);
      if (added) {
        onTagsChange([...tags, added], suggestions.filter((t) => t.id !== tagId));
      }
    } catch {
      toast.show(t("tag_add_error", "Не удалось добавить тег"), "error");
    }
  }

  async function handleRemoveTag(tagId: string) {
    try {
      await apiFetch(`/api/v1/tags/documents/${documentId}/${tagId}`, { method: "DELETE" });
      const removed = tags.find((t) => t.id === tagId);
      if (removed) {
        onTagsChange(tags.filter((t) => t.id !== tagId), [...suggestions, removed]);
      }
    } catch {
      toast.show(t("tag_remove_error", "Не удалось удалить тег"), "error");
    }
  }

  if (tags.length === 0 && suggestions.length === 0) return null;

  return (
    <div className="modal-tags-row">
      {tags.map((tag) => (
        <span key={tag.id} className="modal-tag">
          {tag.name}
          <button
            type="button"
            className="modal-tag-remove"
            onClick={() => handleRemoveTag(tag.id)}
            aria-label={t("tag_remove", "Убрать тег")}
          >
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      {suggestions.length > 0 && (
        <div className="modal-tag-add-wrap" ref={tagPickerRef}>
          <button
            type="button"
            className="modal-tag-add-btn"
            onClick={() => { setShowTagPicker(!showTagPicker); setTagSearch(""); setTimeout(() => tagSearchRef.current?.focus(), 0); }}
            aria-label={t("tag_add", "Добавить тег")}
          >
            <Icon name="plus" size={14} />
          </button>
          {showTagPicker && (() => {
            const filtered = tagSearch
              ? suggestions.filter((tg) => tg.name.toLowerCase().includes(tagSearch.toLowerCase()))
              : suggestions;
            return (
              <div className="modal-tag-picker">
                <input
                  ref={tagSearchRef}
                  type="text"
                  className="modal-tag-search"
                  placeholder={t("tag_search", "Поиск...")}
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
                {filtered.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="modal-tag-option"
                    onClick={() => { handleAddTag(tag.id); setShowTagPicker(false); }}
                  >
                    {tag.name}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="modal-tag-empty">{t("no_results", "Ничего не найдено")}</div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
