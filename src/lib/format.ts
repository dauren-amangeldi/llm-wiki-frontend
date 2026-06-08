const LANGUAGE_LOCALES: Record<string, string> = {
  ru: "ru-RU", en: "en-US", kk: "kk-KZ",
};

export function formatDate(
  value: string | Date,
  language: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  const locale = LANGUAGE_LOCALES[language] || "ru-RU";
  return new Intl.DateTimeFormat(locale, options || {
    year: "numeric", month: "short", day: "numeric",
  }).format(d);
}

export function relativeTime(isoString: string, language = "ru"): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  if (isNaN(then)) return isoString;
  const diffSec = Math.round((then - now) / 1000);
  const locale = LANGUAGE_LOCALES[language] || "ru-RU";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86400), "day");
}

export function emailInitials(email: string): string {
  const local = email.split("@")[0] || "";
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
