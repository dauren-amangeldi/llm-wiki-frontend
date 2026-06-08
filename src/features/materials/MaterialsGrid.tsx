import type { Material } from "../../stores/materials";
import { useMaterialsStore } from "../../stores/materials";
import { useUiStore } from "../../stores/ui";
import { CardSkeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { MaterialCard } from "./MaterialCard";
import { MaterialRow } from "./MaterialRow";

interface MaterialsGridProps {
  materials: Material[];
}

export function MaterialsGrid({ materials }: MaterialsGridProps) {
  const viewMode = useUiStore((s) => s.viewMode);
  const loading = useMaterialsStore((s) => s.loading);

  if (loading) {
    return (
      <div className="materials-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <EmptyState
        icon="search"
        titleKey="empty_search_title"
        descKey="empty_search_desc"
      />
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="materials-grid">
        {materials.map((m) => (
          <MaterialCard key={m.document_id} material={m} />
        ))}
      </div>
    );
  }

  return (
    <div className="materials-list">
      {materials.map((m) => (
        <MaterialRow key={m.document_id} material={m} />
      ))}
    </div>
  );
}
