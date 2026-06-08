export const STORAGE_KEYS = {
  language: "bi_language",
  theme: "bi_theme",
  viewMode: "bi_viewMode",
  session: "bi_session",
  history: "bi_history",
} as const;

export const STUDIO_ITEMS = [
  { key: "test", icon: "help-circle", label: "studio_test" },
  { key: "presentation", icon: "presentation", label: "studio_presentation" },
  { key: "report", icon: "file-text", label: "studio_report" },
  { key: "cards", icon: "credit-card", label: "studio_cards" },
  { key: "podcast", icon: "podcast", label: "studio_podcast" },
  { key: "infographic", icon: "bar-chart-2", label: "studio_infographic" },
] as const;

export const ACCEPTED_SOURCE_EXTENSIONS = [
  ".pdf", ".docx", ".doc", ".pptx", ".ppt",
  ".txt", ".md", ".mp3", ".wav", ".m4a", ".webm", ".ogg",
] as const;
