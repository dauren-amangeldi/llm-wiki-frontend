import { useTranslation } from "react-i18next";

/**
 * Animated three-dot typing indicator for chat/AI responses.
 * Optionally shows a status label like "Analyzing..." or "Generating...".
 */
export function TypingIndicator({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="typing-indicator" aria-live="polite" aria-label={t("ai_thinking", "AI thinking...")}>
      {label && <span className="typing-label">{label}</span>}
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/**
 * Step-based progress for AI generation (Studio).
 * Shows current step, total steps, and an animated progress bar.
 */
export function GenerationProgress({ step, totalSteps, label }: { step: number; totalSteps: number; label: string }) {
  const pct = Math.round((step / totalSteps) * 100);
  return (
    <div className="generation-progress" aria-live="polite">
      <div className="generation-progress-header">
        <span className="generation-progress-label">{label}</span>
        <span className="generation-progress-step">{step}/{totalSteps}</span>
      </div>
      <div className="generation-progress-bar">
        <div className="generation-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
