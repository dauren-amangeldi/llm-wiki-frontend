import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Icon } from "../../components/Icon";

interface Section {
  title: string;
  body: string;
}

export function SectionBlock({ section, defaultExpanded }: { section: Section; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const lines = section.body.trim().split("\n").filter(Boolean);
  const needsCollapse = lines.length > 4;
  const visibleBody = needsCollapse && !expanded ? lines.slice(0, 4).join("\n") : section.body.trim();

  return (
    <div className="guide-section">
      <h4 className="guide-section-title">{section.title}</h4>
      <div className="guide-section-body">
        <ReactMarkdown>{visibleBody}</ReactMarkdown>
      </div>
      {needsCollapse && (
        <button type="button" className="guide-expand-btn" onClick={() => setExpanded((p) => !p)}>
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={14} />
          {expanded ? "Свернуть" : `Ещё ${lines.length - 4}`}
        </button>
      )}
    </div>
  );
}
