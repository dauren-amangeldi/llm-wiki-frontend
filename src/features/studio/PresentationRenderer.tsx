import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

interface SlideRaw {
  title?: string;
  heading?: string;
  body?: string;
  bullets?: string[];
  key_visual_idea?: string;
}

function slideTitle(s: SlideRaw): string {
  return s.heading || s.title || "";
}

function slideBody(s: SlideRaw): string {
  if (s.bullets?.length) return s.bullets.map((b) => `• ${b}`).join("\n");
  return s.body || "";
}

export function PresentationRenderer({ content }: { content: unknown }) {
  const { t } = useTranslation();
  const data = content as { slides?: SlideRaw[]; format?: string; url?: string; title?: string; pages?: number };
  // Hooks must be called unconditionally — before any early returns
  const [current, setCurrent] = useState(0);

  /* PDF format — show embedded viewer */
  if (data?.format === "pdf" && data?.url) {
    // Validate URL — only allow relative paths or same-origin
    const url = data.url.startsWith("/") ? data.url : "";
    if (!url) return <p className="prose-muted">{t("invalid_url", "Некорректная ссылка")}</p>;
    return (
      <div className="presentation-wrap">
        <div className="presentation-pdf-header">
          <Icon name="file-text" size={16} />
          <span>{data.title || t("presentation", "Презентация")}</span>
          {data.pages && <span className="presentation-pdf-pages">{data.pages} {t("pages_label", "стр.")}</span>}
          <a href={url} target="_blank" rel="noopener noreferrer" className="presentation-pdf-download" title={t("download", "Скачать")}>
            <Icon name="download" size={14} />
          </a>
        </div>
        <iframe
          src={url}
          className="presentation-pdf-embed"
          title={data.title || "Presentation PDF"}
        />
      </div>
    );
  }

  const slides = data?.slides ?? [];

  if (!slides.length) return <p className="prose-muted">{t("no_slides", "Нет слайдов")}</p>;

  const slide = slides[current];
  const title = slideTitle(slide);
  const body = slideBody(slide);

  return (
    <div className="presentation-wrap">
      <div className="presentation-slide">
        {title && <h3>{title}</h3>}
        <p style={{ textAlign: "left", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.8 }}>{body}</p>
      </div>
      <div className="presentation-nav">
        <button className="icon-button" disabled={current === 0} onClick={() => setCurrent((p) => p - 1)}>
          <Icon name="chevron-left" size={16} />
        </button>
        <span className="presentation-counter">{current + 1} / {slides.length}</span>
        <button className="icon-button" disabled={current === slides.length - 1} onClick={() => setCurrent((p) => p + 1)}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}
