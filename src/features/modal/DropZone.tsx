import { useCallback, useRef, useState, type DragEvent } from "react";
import { Icon } from "../../components/Icon";
import { ACCEPTED_SOURCE_EXTENSIONS } from "../../lib/constants";
import { useTranslation } from "react-i18next";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  uploading?: boolean;
  progress?: number;
  uploadCount?: number;
  completedCount?: number;
}

const acceptString = ACCEPTED_SOURCE_EXTENSIONS.join(",");
const FORMATS_LABEL = "PDF, DOCX, PPTX, TXT, MD, MP3, WAV";

export function DropZone({ onFilesSelected, uploading, progress, uploadCount, completedCount }: DropZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  }, [dragging]);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected],
  );

  const handleChange = useCallback(() => {
    const files = Array.from(inputRef.current?.files ?? []);
    if (files.length > 0) onFilesSelected(files);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFilesSelected]);

  const cls = [
    "add-source-dropzone",
    dragging ? "is-dragover" : "",
    uploading ? "is-uploading" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cls}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !uploading) { e.preventDefault(); inputRef.current?.click(); } }}
      role="button"
      tabIndex={0}
      aria-label={t("drop_zone_label", "Upload files")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        multiple
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {uploading ? (
        <>
          <Icon name="loader" size={24} className="animate-spin" />
          <span className="add-source-drop-hint">
            {uploadCount && uploadCount > 1 && completedCount !== undefined
              ? t("upload_progress_multi", "{{done}} из {{total}} файлов загружено", { done: completedCount, total: uploadCount })
              : progress != null ? `${progress}%` : t("uploading", "Загрузка...")}
          </span>
        </>
      ) : dragging ? (
        <>
          <div style={{ margin: "0 auto", color: "var(--accent)" }}>
            <Icon name="cloud-upload" size={28} />
          </div>
          <span className="add-source-drop-hint" style={{ color: "var(--accent)", fontWeight: 500 }}>
            {t("drop_release", "Отпустите для загрузки")}
          </span>
        </>
      ) : (
        <>
          <div className="dropzone-icon">
            <Icon name="paperclip" size={28} />
          </div>
          <span className="add-source-drop-title">
            {t("add_sources_drop_hint_multi", "Перетащите файлы сюда или нажмите")}
          </span>
          <span className="add-source-formats">{FORMATS_LABEL}</span>
        </>
      )}
    </div>
  );
}
