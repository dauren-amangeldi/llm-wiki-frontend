import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { useToastStore } from "../../components/Toast";
import { Icon } from "../../components/Icon";

interface ExportButtonsProps {
  artifactId: string;
  kind: string;
  audioUrl?: string;
}

const KIND_FORMATS: Record<string, string[]> = {
  test: ["pdf", "docx"],
  report: ["pdf", "docx"],
  presentation: ["pdf", "pptx"],
  card: ["pdf", "docx"],
  cards: ["pdf", "docx"],
  podcast: [],
  infographic: [],
};

export function ExportButtons({ artifactId, kind, audioUrl }: ExportButtonsProps) {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);
  const toast = useToastStore();
  const [exporting, setExporting] = useState<string | null>(null);

  const formats = KIND_FORMATS[kind] ?? ["pdf", "docx"];

  async function handleExport(format: string) {
    setExporting(format);
    try {
      const res = await apiFetch<{ url?: string }>(`/api/v1/artifacts/${artifactId}/export`, {
        method: "POST",
        body: JSON.stringify({ format, language }),
      });
      if (res.url) {
        window.open(res.url, "_blank");
      } else {
        window.open(`/api/v1/artifacts/${artifactId}/export?format=${format}&language=${language}`, "_blank");
      }
      toast.show(t("export_success", "Экспорт готов"), "success");
    } catch {
      toast.show(t("export_error", "Ошибка экспорта"), "error");
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      {formats.map((fmt) => (
        <button key={fmt} className="btn" onClick={() => handleExport(fmt)} disabled={exporting !== null}>
          {exporting === fmt ? <Icon name="loader-circle" size={16} className="animate-spin" /> : <Icon name="file-down" size={16} />}
          {fmt.toUpperCase()}
        </button>
      ))}
      {kind === "podcast" && audioUrl && (
        <a href={audioUrl} download className="btn">
          <Icon name="download" size={16} /> MP3
        </a>
      )}
      {kind === "infographic" && (
        <button className="btn" onClick={() => {
          const img = document.querySelector<HTMLImageElement>(".infographic-img");
          if (img?.src) { const a = document.createElement("a"); a.href = img.src; a.download = "infographic.png"; a.click(); }
        }}>
          <Icon name="image-down" size={16} /> PNG
        </button>
      )}
    </>
  );
}
