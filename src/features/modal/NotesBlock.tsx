import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

const STORAGE_KEY = "material-notes";

function loadNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveNote(docId: string, text: string) {
  const all = loadNotes();
  if (text.trim()) {
    all[docId] = text;
  } else {
    delete all[docId];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

interface NotesBlockProps {
  documentId: string;
}

export function NotesBlock({ documentId }: NotesBlockProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const notes = loadNotes();
    setText(notes[documentId] || "");
    return () => clearTimeout(savedTimer.current);
  }, [documentId]);

  const handleSave = useCallback(() => {
    saveNote(documentId, text);
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1500);
  }, [documentId, text]);

  return (
    <div className="notes-block">
      <div className="notes-block-head">
        <Icon name="sticky-note" size={14} />
        <span>{t("notes_title", "Мои заметки")}</span>
        {saved && <span className="notes-saved">{t("notes_saved", "Сохранено")}</span>}
      </div>
      <textarea
        className="notes-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        placeholder={t("notes_placeholder", "Запишите мысли по материалу...")}
        rows={3}
      />
    </div>
  );
}
