import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { StudioGenerateButton } from "./StudioGenerateButton";

interface StudioArtifactCardProps {
  itemKey: string;
  icon: string;
  label: string;
  loading: boolean;
  disabled: boolean;
  hasExisting: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function StudioArtifactCard({
  itemKey,
  icon,
  label,
  loading,
  disabled,
  hasExisting,
  onClick,
}: StudioArtifactCardProps) {
  const { t } = useTranslation();

  return (
    <button
      key={itemKey}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`studio-card${hasExisting ? " has-artifact" : ""}`}
      data-kind={itemKey}
    >
      <StudioGenerateButton icon={icon} loading={loading} />
      <div className="studio-card-title">{t(label)}</div>
      <div className="studio-card-subtitle">{t(`${label}_sub`, "")}</div>
      {hasExisting && (
        <span className="studio-card-ready">
          <Icon name="check-circle" size={14} />
        </span>
      )}
    </button>
  );
}
