import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/auth";
import { useUiStore } from "../../stores/ui";
import { Icon } from "../../components/Icon";
import { resetOnboarding } from "../../components/Onboarding";

const LANGUAGES = [
  { code: "ru" as const, label: "Русский" },
  { code: "en" as const, label: "English" },
  { code: "kk" as const, label: "Қазақша" },
];

export function UserMenu() {
  const { t, i18n } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage } = useUiStore();
  const setOpenMenu = useUiStore((s) => s.setOpenMenu);

  if (!session) return null;

  return (
    <div className="dropdown-menu user-menu-dropdown">
      {/* User info */}
      <div className="user-menu-header">
        <div className="user-menu-name">{session.email.split("@")[0]}</div>
        <div className="user-menu-email">{session.email}</div>
      </div>

      <div className="dropdown-divider" />

      {/* Language */}
      <div className="user-menu-lang">
        <span className="user-menu-lang-label">
          <Icon name="globe" size={16} />
          {t("language_menu_title", "Язык")}
        </span>
        <div className="user-menu-lang-options">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              className={`user-menu-lang-btn${language === code ? " active" : ""}`}
              onClick={() => { setLanguage(code); i18n.changeLanguage(code); }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="dropdown-divider" />

      {/* Onboarding tour */}
      <button
        className="dropdown-item"
        onClick={() => { setOpenMenu(null); resetOnboarding(); }}
      >
        <Icon name="compass" size={16} />
        {t("onboard_restart", "Пройти обзор")}
      </button>

      <div className="dropdown-divider" />

      {/* Logout */}
      <button
        className="dropdown-item dropdown-item-danger"
        onClick={() => { setOpenMenu(null); logout(); }}
      >
        <Icon name="log-out" size={16} />
        {t("logout")}
      </button>
    </div>
  );
}
