import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

interface RefusalBoxProps {
  contact?: string;
}

export function RefusalBox({ contact }: RefusalBoxProps) {
  const { t } = useTranslation();
  return (
    <div className="refusal-box">
      <span className="refusal-icon"><Icon name="search-x" size={20} /></span>
      <div>
        {t("refusal_message", "По вашему запросу материалов в базе знаний не найдено.")}
        {contact && (
          <>
            <br />
            {t("refusal_contact_prefix", "Попробуйте переформулировать запрос или обратитесь к:")}{" "}
            <a href={`mailto:${contact}`} style={{ color: "var(--accent)" }}>{contact}</a>
          </>
        )}
      </div>
    </div>
  );
}
