import { useUiStore } from "../stores/ui";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "kk" as const, label: "Қазақша" },
  { code: "ru" as const, label: "Русский" },
  { code: "en" as const, label: "English" },
];

export function LanguageSlider() {
  const { language, setLanguage } = useUiStore();
  const { i18n } = useTranslation();

  return (
    <div className="language-slider" role="tablist">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          role="tab"
          aria-selected={language === code}
          className={`language-slider-btn${language === code ? " active" : ""}`}
          onClick={() => {
            setLanguage(code);
            i18n.changeLanguage(code);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
