import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNotificationsStore } from "../../stores/notifications";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Icon } from "../../components/Icon";

const typeIcons: Record<string, string> = {
  info: "info",
  success: "circle-check",
  warning: "triangle-alert",
  error: "x-circle",
};

export function NotificationDropdown() {
  const { t } = useTranslation();
  const notifications = useNotificationsStore((s) => s.notifications);
  const closeDropdown = useNotificationsStore((s) => s.closeDropdown);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, closeDropdown);

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("time_just_now", "только что");
    if (mins < 60) return t("time_minutes_ago", { n: mins, defaultValue: "{{n}} мин назад" });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("time_hours_ago", { n: hrs, defaultValue: "{{n}} ч назад" });
    const days = Math.floor(hrs / 24);
    return t("time_days_ago", { n: days, defaultValue: "{{n}} д назад" });
  }

  return (
    <div ref={ref} className="notification-dropdown">
      <div className="notification-dropdown-header">
        <span>{t("notifications_title", "Уведомления")}</span>
      </div>
      {notifications.length === 0 ? (
        <div className="notification-empty">
          {t("no_notifications", "Нет уведомлений")}
        </div>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notification-item${!n.read ? " unread" : ""}`}
            >
              <Icon
                name={typeIcons[n.type] || "info"}
                size={16}
              />
              <div className="notification-item-body">
                <p>{n.text}</p>
                <span className="notification-time">
                  {relativeTime(n.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
