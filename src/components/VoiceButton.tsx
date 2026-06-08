import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/ui";
import { useVoiceInput, isVoiceSupported } from "../hooks/useVoiceInput";
import { Icon } from "./Icon";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  mode?: "continuous" | "single";
  className?: string;
}

export function VoiceButton({ onTranscript, mode = "single", className }: VoiceButtonProps) {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);

  const handleResult = useCallback(
    (text: string) => onTranscript(text),
    [onTranscript],
  );

  const { isListening, isSupported, error, startListening, stopListening } = useVoiceInput({
    lang: language,
    mode,
    onResult: handleResult,
  });

  if (!isSupported) return null;

  const errorTitle = error === "not-allowed"
    ? t("voice_permission_denied", "Доступ к микрофону запрещён")
    : error === "network"
      ? t("voice_network_error", "Ошибка сети")
      : undefined;

  return (
    <button
      type="button"
      className={`voice-btn${isListening ? " voice-btn--active" : ""}${error ? " voice-btn--error" : ""} ${className || ""}`}
      onClick={isListening ? stopListening : startListening}
      aria-label={isListening ? t("voice_stop", "Остановить запись") : t("voice_start", "Голосовой ввод")}
      title={errorTitle}
    >
      <Icon name={isListening ? "mic-off" : "mic"} size={18} />
    </button>
  );
}

export { isVoiceSupported };
