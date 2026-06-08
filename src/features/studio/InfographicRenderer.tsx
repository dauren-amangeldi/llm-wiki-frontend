import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";

const PURIFY_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ["use"],
  FORBID_TAGS: ["script", "style"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "xlink:href"],
};

export function InfographicRenderer({ content }: { content: unknown }) {
  const { t } = useTranslation();
  const data = content as { image_url?: string; url?: string; svg?: string; title?: string; format?: string } | null;
  const imageUrl = data?.image_url || (data?.format === "image" ? data?.url : null) || data?.url;

  if (data?.svg) {
    const clean = DOMPurify.sanitize(data.svg, PURIFY_CONFIG);
    return <div className="infographic-wrap" dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  if (imageUrl) {
    return (
      <div className="infographic-wrap">
        <img src={imageUrl} alt={data?.title || "Infographic"} className="infographic-img" />
      </div>
    );
  }

  return <p className="prose-muted">{t("no_infographic", "Нет инфографики")}</p>;
}
