import React from "react";
import type { ReactNode } from "react";

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || <ErrorFallback error={this.state.error} />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ error }: { error: Error | null }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: "12px", padding: "32px", textAlign: "center",
    }}>
      <p style={{ fontSize: "14px", color: "var(--error, #ef4444)" }}>
        {error?.message || "Something went wrong"}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
        style={{ padding: "8px 16px", fontSize: "14px" }}
      >
        Reload / Перезагрузить
      </button>
    </div>
  );
}
