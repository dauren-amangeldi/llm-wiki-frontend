import { useEffect } from "react";
import { useNotificationsStore } from "../../stores/notifications";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";
import { NotificationDropdown } from "./NotificationDropdown";

interface NotificationPayload {
  id: string;
  text: string;
  type: string;
  created_at: string;
  read: boolean;
}

export function NotificationBell() {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const dropdownOpen = useNotificationsStore((s) => s.dropdownOpen);
  const toggleDropdown = useNotificationsStore((s) => s.toggleDropdown);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  useEffect(() => {
    const ac = new AbortController();

    async function fetchNotifications() {
      try {
        const data = await apiFetch<NotificationPayload[]>("/api/v1/notifications", { signal: ac.signal });
        if (!ac.signal.aborted) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // silently ignore other fetch errors for notifications
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => { ac.abort(); clearInterval(interval); };
  }, [setNotifications, setUnreadCount]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggleDropdown}
        className="icon-button"
        title="Уведомления"
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {dropdownOpen && <NotificationDropdown />}
    </div>
  );
}
