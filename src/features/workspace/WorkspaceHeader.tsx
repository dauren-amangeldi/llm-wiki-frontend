import { useRef, useCallback } from "react";
import { useAuthStore } from "../../stores/auth";
import { useUiStore } from "../../stores/ui";
import { Icon } from "../../components/Icon";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useTranslation } from "react-i18next";
import { emailInitials } from "../../lib/format";
import { NewMenu } from "../menus/NewMenu";
import { UserMenu } from "../menus/UserMenu";
import { HistoryMenu } from "../menus/HistoryMenu";
import { NotificationBell } from "../notifications/NotificationBell";
import { ThemeToggle } from "../../components/ThemeToggle";

export function WorkspaceHeader() {
  const { t } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const openMenu = useUiStore((s) => s.openMenu);
  const setOpenMenu = useUiStore((s) => s.setOpenMenu);

  const newRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), [setOpenMenu]);

  useClickOutside(newRef, () => { if (openMenu === "new") closeMenu(); });
  useClickOutside(userRef, () => { if (openMenu === "user" || openMenu === "history") closeMenu(); });

  const toggle = (name: string) =>
    setOpenMenu(openMenu === name ? null : name);

  return (
    <header className="workspace-header">
      <img src="/logo.svg" alt="BI AQYL" className="brand-logo" />

      <div className="workspace-actions">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* New */}
        <div ref={newRef} className="header-pill-wrap">
          <button onClick={() => toggle("new")} className="btn btn-primary btn-new">
            <Icon name="plus" size={16} />
            <span>{t("new_button")}</span>
          </button>
          {openMenu === "new" && <NewMenu />}
        </div>

        {/* User avatar (theme, lang, history, logout inside) */}
        <div ref={userRef} className="header-pill-wrap">
          <button
            onClick={() => toggle("user")}
            className="avatar-button"
            aria-label={t("open_user_menu", "Открыть меню пользователя")}
            aria-expanded={openMenu === "user"}
            aria-haspopup="menu"
          >
            <span className="avatar-initials">
              {session ? emailInitials(session.email) : "?"}
            </span>
          </button>
          {openMenu === "user" && <UserMenu />}
          {openMenu === "history" && <HistoryMenu />}
        </div>
      </div>
    </header>
  );
}
