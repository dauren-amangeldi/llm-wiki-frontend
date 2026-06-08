import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { apiFetch } from "../../api/client";
import { useMaterialsStore, type Material } from "../../stores/materials";
import { useModalStore } from "../../stores/modal";
import { useUiStore } from "../../stores/ui";

interface MaterialHeaderProps {
  material: Material;
  onClose: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function MaterialHeader({ material, onClose, hasPrev, hasNext, onPrev, onNext }: MaterialHeaderProps) {
  const { t } = useTranslation();
  const updateMaterial = useMaterialsStore((s) => s.updateMaterial);
  const setModalMaterial = useModalStore((s) => s.setMaterial);

  const language = useUiStore((s) => s.language);
  const displayTitle = material.title_i18n?.[language] || material.title;

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  const handleStartEdit = () => {
    setEditTitle(material?.title || "");
    setEditing(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const handleSaveTitle = async () => {
    if (savingRef.current) return; // guard against Enter + blur double-fire
    savingRef.current = true;
    setEditing(false);
    const trimmed = editTitle.trim();
    if (!material || trimmed === material.title || !trimmed) {
      savingRef.current = false;
      return;
    }
    try {
      await apiFetch(`/api/v1/documents/${material.document_id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: trimmed }),
      });
      const updated = { ...material, title: trimmed };
      updateMaterial(updated);
      setModalMaterial(updated);
    } catch {
      // revert silently
    } finally {
      savingRef.current = false;
    }
  };

  return (
    <>
      <button type="button" className="icon-button" onClick={onClose} aria-label={t("back")}>
        <Icon name="arrow-left" size={20} />
      </button>
      <div className="material-modal-title-group">
        {editing ? (
          <input
            ref={titleRef}
            className="modal-title-edit"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditing(false); }}
          />
        ) : (
          <h2 role="button" tabIndex={0} onClick={handleStartEdit} onKeyDown={(e) => { if (e.key === "Enter") handleStartEdit(); }} className="modal-title-clickable" aria-label={t("click_to_edit", "Нажмите для редактирования")} title={t("click_to_edit", "Нажмите для редактирования")}>
            {displayTitle}
            <Icon name="pencil" size={14} className="modal-title-edit-icon" />
          </h2>
        )}
      </div>
      <div className="modal-nav-arrows">
        <button type="button" className="modal-nav-btn" onClick={onPrev} disabled={!hasPrev} aria-label="Previous">
          <Icon name="chevron-left" size={16} />
        </button>
        <button type="button" className="modal-nav-btn" onClick={onNext} disabled={!hasNext} aria-label="Next">
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </>
  );
}
