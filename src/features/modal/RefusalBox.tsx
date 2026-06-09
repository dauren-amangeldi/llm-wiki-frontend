import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

export function RefusalBox() {
  const { t } = useTranslation();
  return (
    <div className="refusal-box">
      <span className="refusal-icon"><Icon name="search-x" size={20} /></span>
      <div>
        {t(
          "no_results_retry",
          "В материале не нашлось ответа. Попробуйте переформулировать или задать более конкретный вопрос.",
        )}
      </div>
    </div>
  );
}
