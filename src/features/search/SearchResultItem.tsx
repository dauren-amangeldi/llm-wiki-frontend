import { Icon } from "../../components/Icon";
import type { Material } from "../../stores/materials";

interface SearchResultItemProps {
  item: Material;
  selected: boolean;
  onClick: () => void;
}

const typeIcons: Record<string, string> = {
  pdf: "file-text", docx: "file-text", xlsx: "table",
  pptx: "presentation", image: "image", video: "video", default: "file",
};

function iconForType(contentType: string): string {
  const lower = contentType.toLowerCase();
  for (const [key, icon] of Object.entries(typeIcons)) {
    if (lower.includes(key)) return icon;
  }
  return typeIcons.default;
}

export function SearchResultItem({ item, selected, onClick }: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`search-result-item${selected ? " focused" : ""}`}
    >
      <div className="search-result-icon">
        <Icon name={iconForType(item.content_type)} size={16} />
      </div>
      <div className="search-result-body">
        <div className="search-result-title">{item.title}</div>
        {typeof item.snippet === "string" && item.snippet && (
          <div className="search-result-snippet">{item.snippet}</div>
        )}
      </div>
      <span className="search-result-badge">{item.scope}</span>
    </button>
  );
}
