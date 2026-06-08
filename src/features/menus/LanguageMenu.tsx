import { useTranslation } from "react-i18next";
import { useUiStore } from "../../stores/ui";

const LANGUAGES = [
  { code: "ru" as const, label: "Русский" },
  { code: "en" as const, label: "English" },
  { code: "kk" as const, label: "Қазақша" },
];

export function LanguageMenu() {
  const { i18n, t } = useTranslation();
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const setOpenMenu = useUiStore((s) => s.setOpenMenu);

  const pick = (code: "ru" | "en" | "kk") => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setOpenMenu(null);
  };

  return (
    <div className="dropdown-menu" style={{ minWidth: 180 }}>
      <div className="dropdown-header">{t("language_menu_title")}</div>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => pick(lang.code)}
          className={`dropdown-item${language === lang.code ? " active" : ""}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
