import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

interface EmptyStateProps {
  icon: string;
  titleKey: string;
  descKey: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, titleKey, descKey, actionLabel, onAction }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={48} />
      </div>
      <h3 className="empty-state-title">{t(titleKey)}</h3>
      <p className="empty-state-desc">{t(descKey)}</p>
      {actionLabel && onAction && (
        <button className="btn btn-secondary empty-state-action" onClick={onAction}>
          {t(actionLabel)}
        </button>
      )}
    </div>
  );
}
