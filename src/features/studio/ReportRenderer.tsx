import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";

interface ReportData {
  markdown?: string;
  title?: string;
  metrics?: { label: string; value: string }[];
  executive_summary?: string;
  sections?: { heading: string; body: string }[];
  conclusions?: string;
}

function toMarkdown(data: ReportData, headings: { summary: string; metrics: string; conclusions: string }): string {
  if (data.markdown) return data.markdown;

  const parts: string[] = [];
  if (data.title) parts.push(`# ${data.title}\n`);
  if (data.executive_summary) parts.push(`## ${headings.summary}\n\n${data.executive_summary}\n`);
  if (data.metrics?.length) {
    parts.push(`## ${headings.metrics}\n`);
    for (const m of data.metrics) parts.push(`- **${m.label}**: ${m.value}`);
    parts.push("");
  }
  if (data.sections?.length) {
    for (const s of data.sections) {
      parts.push(`## ${s.heading}\n\n${s.body}\n`);
    }
  }
  if (data.conclusions) parts.push(`## ${headings.conclusions}\n\n${data.conclusions}\n`);
  return parts.join("\n");
}

const EMPTY_REPORT: ReportData = {};

export function ReportRenderer({ content }: { content: unknown }) {
  const { t } = useTranslation();
  const data = (content ?? EMPTY_REPORT) as ReportData;

  const headings = useMemo(() => ({
    summary: t("report_heading_summary", "Executive Summary"),
    metrics: t("report_heading_metrics", "Key Metrics"),
    conclusions: t("report_heading_conclusions", "Conclusions"),
  }), [t]);

  const markdown = useMemo(() => toMarkdown(data, headings), [data, headings]);

  if (!markdown) return <p className="prose-muted">{t("no_report", "No report")}</p>;

  return (
    <article className="prose">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}
