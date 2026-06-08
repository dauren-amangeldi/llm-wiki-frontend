import { Icon } from "../../components/Icon";

interface StudioGenerateButtonProps {
  icon: string;
  loading: boolean;
}

export function StudioGenerateButton({ icon, loading }: StudioGenerateButtonProps) {
  return (
    <div className="studio-card-icon">
      {loading ? (
        <Icon name="loader" size={32} className="animate-spin" />
      ) : (
        <Icon name={icon} size={32} />
      )}
    </div>
  );
}
