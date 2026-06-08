import { Icon } from "./Icon";

interface BadgeProps {
  icon?: string;
  label: string;
  className?: string;
}

export function Badge({ icon, label, className = "" }: BadgeProps) {
  return (
    <span className={`badge ${className}`}>
      {icon && <Icon name={icon} size={12} />}
      {label}
    </span>
  );
}
