/** Map content type or file extension to a Lucide icon name */
const ICON_MAP: Record<string, string> = {
  pdf: "file-text",
  document: "file-text",
  docx: "file-type",
  doc: "file-type",
  video: "video",
  audio: "headphones",
  image: "image",
  spreadsheet: "table",
  presentation: "presentation",
  pptx: "presentation",
  ppt: "presentation",
  link: "link",
  mp3: "music",
  wav: "music",
  m4a: "music",
};

export function contentTypeIcon(type?: string): string {
  if (!type) return "file";
  return ICON_MAP[type.toLowerCase()] || "file";
}
