/**
 * Reusable skeleton loading components.
 * All use the .skeleton CSS class with shimmer animation.
 */

export function Skeleton({ style, className = "" }: { style?: React.CSSProperties; className?: string }) {
  return <div className={`skeleton ${className}`} style={{ height: 16, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <Skeleton style={{ height: 36, width: 36, borderRadius: "var(--radius-md)" }} />
      <Skeleton style={{ height: 16, width: "75%" }} />
      <Skeleton style={{ height: 12, width: "50%" }} />
      <Skeleton style={{ height: 12, width: "33%" }} />
    </div>
  );
}

export function MaterialGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="materials-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="material-card-skeleton">
          <div className="material-card-skeleton-row">
            <Skeleton style={{ height: 32, width: 32, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <Skeleton style={{ height: 16, width: "70%" }} />
          </div>
          <Skeleton style={{ height: 12, width: "90%" }} />
          <Skeleton style={{ height: 12, width: "60%" }} />
          <div className="material-card-skeleton-footer">
            <Skeleton style={{ height: 10, width: "25%" }} />
            <Skeleton style={{ height: 10, width: "15%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="metrics-stat-card">
      <Skeleton style={{ height: 40, width: 40, borderRadius: "var(--radius-md)" }} />
      <Skeleton style={{ height: 28, width: "50%" }} />
      <Skeleton style={{ height: 12, width: "65%" }} />
    </div>
  );
}

export function ModalColumnSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "var(--space-3)" }}>
      <Skeleton style={{ height: 14, width: "40%" }} />
      <Skeleton style={{ height: 80, width: "100%", borderRadius: "var(--radius-md)" }} />
      <Skeleton style={{ height: 12, width: "70%" }} />
      <Skeleton style={{ height: 12, width: "55%" }} />
      <Skeleton style={{ height: 12, width: "30%" }} />
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="metrics-section">
      <div className="metrics-stats-row">
        {Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="metrics-charts-row">
        <div className="metrics-chart-card metrics-chart-wide">
          <Skeleton style={{ height: 14, width: "30%", marginBottom: 16 }} />
          <Skeleton style={{ height: 200, width: "100%", borderRadius: "var(--radius-md)" }} />
        </div>
        <div className="metrics-chart-card">
          <Skeleton style={{ height: 14, width: "25%", marginBottom: 16 }} />
          <Skeleton style={{ height: 200, width: "100%", borderRadius: "50%" }} className="skeleton-circle-lg" />
        </div>
      </div>
    </div>
  );
}
