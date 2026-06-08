import { useState, useRef, useCallback, useEffect } from "react";

const LANG_MAP: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
  kk: "kk-KZ",
};

const SpeechRecognitionClass =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

export const isVoiceSupported = !!SpeechRecognitionClass;

interface UseVoiceInputOptions {
  lang?: string;
  mode?: "continuous" | "single";
  silenceTimeout?: number;
  onResult?: (transcript: string) => void;
}

export function useVoiceInput({
  lang = "en",
  mode = "single",
  silenceTimeout = 3000,
  onResult,
}: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedByUser = useRef(false);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    stoppedByUser.current = true;
    clearSilenceTimer();
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* already stopped */ }
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionClass || isListening) return;

    setError(null);
    stoppedByUser.current = false;

    const rec = new SpeechRecognitionClass();
    rec.continuous = mode === "continuous";
    rec.interimResults = false;
    rec.lang = LANG_MAP[lang] || "en-US";

    rec.onstart = () => setIsListening(true);

    rec.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer();

      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript && onResult) {
        onResult(finalTranscript.trim());
      }

      // Reset silence timer
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, silenceTimeout);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error;
      if (code === "aborted" || code === "no-speech") {
        // Non-critical — just stop
        setIsListening(false);
        return;
      }
      setError(code === "not-allowed" ? "not-allowed" : code === "network" ? "network" : code);
      setIsListening(false);
    };

    rec.onend = () => {
      clearSilenceTimer();
      // In continuous mode, auto-restart unless user stopped
      if (mode === "continuous" && !stoppedByUser.current) {
        try { rec.start(); } catch { setIsListening(false); }
        return;
      }
      setIsListening(false);
    };

    recognitionRef.current = rec;

    try {
      rec.start();
      // Initial silence timer
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, silenceTimeout);
    } catch {
      setError("start-failed");
      setIsListening(false);
    }
  }, [lang, mode, silenceTimeout, onResult, isListening, clearSilenceTimer, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppedByUser.current = true;
      clearSilenceTimer();
      const rec = recognitionRef.current;
      if (rec) {
        try { rec.abort(); } catch { /* noop */ }
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    isSupported: isVoiceSupported,
    error,
    startListening,
    stopListening,
  };
}
