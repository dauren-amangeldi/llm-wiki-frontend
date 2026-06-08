import { useState, useRef, useEffect, useCallback } from "react";
import { useModalStore } from "../../stores/modal";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";
import { ChatMessage } from "./ChatMessage";
import { VoiceButton } from "../../components/VoiceButton";

/* ── Detailed prompt hints with icons ── */
interface PromptHint {
  icon: string;
  key: string;
  descKey: string;
}

const PROMPT_HINTS: PromptHint[] = [
  { icon: "sparkles",       key: "hint_summarize",          descKey: "hint_summarize_desc" },
  { icon: "list",           key: "hint_key_points",         descKey: "hint_key_points_desc" },
  { icon: "lightbulb",      key: "hint_explain",            descKey: "hint_explain_desc" },
  { icon: "alert-triangle", key: "hint_risks",              descKey: "hint_risks_desc" },
  { icon: "target",         key: "hint_apply",              descKey: "hint_apply_desc" },
  { icon: "bar-chart-2",    key: "hint_compare_approaches", descKey: "hint_compare_desc" },
  { icon: "clipboard-list", key: "hint_action_plan",        descKey: "hint_action_plan_desc" },
  { icon: "briefcase",      key: "hint_for_leadership",     descKey: "hint_for_leadership_desc" },
];

// DossierData type now properly defined in modal store

export function ChatColumn() {
  const { t } = useTranslation();
  const chat = useModalStore((s) => s.chat);
  const material = useModalStore((s) => s.material);
  const dossier = useModalStore((s) => s.dossier);
  const addChatMessage = useModalStore((s) => s.addChatMessage);
  const language = useUiStore((s) => s.language);
  const mode = useUiStore((s) => s.mode);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hintsRef = useRef<HTMLDivElement>(null);

  const showHints = inputFocused && !input.trim() && chat.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  /* Close hints on outside click */
  useEffect(() => {
    if (!showHints) return;
    const onClick = (e: MouseEvent) => {
      if (hintsRef.current && !hintsRef.current.contains(e.target as Node)) {
        setInputFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showHints]);

  const sendQuestion = useCallback(
    async (question: string) => {
      if (!material || !question.trim()) return;
      const trimmed = question.trim();
      addChatMessage({ role: "user", text: trimmed });
      setInput("");
      setInputFocused(false);
      setLoading(true);

      try {
        const endpoint = material.cardSummary
          ? `/api/v1/cards/${material.cardSummary.card_id}/ask`
          : `/api/v1/documents/${material.document_id}/ask`;

        const res = await apiFetch<{
          answer: string;
          insufficient_evidence?: boolean;
          contact?: string;
          citations?: { anchor: string }[];
          follow_ups?: string[];
        }>(endpoint, {
          method: "POST",
          body: JSON.stringify({ question: trimmed, language, mode }),
        });

        if (res.insufficient_evidence) {
          addChatMessage({ role: "assistant", text: res.answer || t("no_results"), follow_ups: res.follow_ups, insufficient_evidence: true, contact: res.contact });
        } else {
          addChatMessage({ role: "assistant", text: res.answer, citations: res.citations, follow_ups: res.follow_ups });
        }
      } catch (err) {
        addChatMessage({ role: "assistant", text: t("chat_error", "Произошла ошибка. Попробуйте позже.") });
        import.meta.env.DEV && console.error("Chat error", err);
      } finally {
        setLoading(false);
      }
    },
    [material, language, mode, addChatMessage, t],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="modal-column notebook-column">
      <div className="modal-column-head">
        <h3>{t("notebook_title", "Чат")}</h3>
      </div>

      {/* Chat log */}
      <div className="modal-chat-log">
        {chat.length === 0 && (() => {
          const aiSummary = typeof material?.cardSummary?.summary === "string" ? material.cardSummary.summary : null;
          const summaryText = aiSummary || dossier?.summary || null;
          return (
          <div className="notebook-stage">
            {summaryText ? (
              <>
                <div className="dossier-card">
                  <div className="dossier-card-head">
                    <Icon name={aiSummary ? "sparkles" : "file-text"} size={18} />
                    <span>{aiSummary ? t("dossier_title_ai", "Резюме") : t("dossier_title", "О материале")}</span>
                    {dossier?.page_count && (
                      <span className="dossier-meta">{t("pages_count", "{{n}} стр.", { n: dossier.page_count })}</span>
                    )}
                  </div>
                  <p className="dossier-summary">{summaryText}</p>
                </div>
                <p className="notebook-stage-cta">{t("chat_welcome_copy", "Задайте вопрос по материалу — ИИ найдёт ответ в источниках")}</p>
              </>
            ) : (
              <>
                <div className="notebook-stage-icon">
                  <Icon name="message-circle" size={34} />
                </div>
                <h3>{t("chat_welcome_title", "Спросите что угодно")}</h3>
                <p>{t("chat_welcome_copy", "Задайте вопрос по материалу — ИИ найдёт ответ в источниках")}</p>
              </>
            )}
          </div>
          );
        })()}
        {chat.map((msg, i) => (
          <ChatMessage key={i} message={msg} onFollowUp={sendQuestion} />
        ))}
        {loading && (
          <div className="chat-bubble chat-bubble-assistant">
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area with hints popup */}
      <div className="chat-compose-wrap" ref={hintsRef}>
        {/* Hints popup — opens upward on input focus */}
        {showHints && (
          <div className="chat-hints-popup">
            <div className="chat-hints-popup-header">
              <Icon name="sparkles" size={14} />
              <span>{t("chat_hints_title", "Подсказки")}</span>
            </div>
            <div className="chat-hints-popup-list">
              {PROMPT_HINTS.map((hint) => (
                <button
                  key={hint.key}
                  type="button"
                  className="chat-hint-item"
                  onClick={() => sendQuestion(t(hint.key))}
                >
                  <span className="chat-hint-icon">
                    <Icon name={hint.icon} size={15} />
                  </span>
                  <span className="chat-hint-text">
                    <span className="chat-hint-title">{t(hint.key)}</span>
                    <span className="chat-hint-desc">{t(hint.descKey)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="chat-compose">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 150)}
            placeholder={t("ask_placeholder", "Задайте вопрос по материалу...")}
            disabled={loading}
            autoFocus
            className="field-input"
          />
          <VoiceButton
            onTranscript={(text) => setInput((prev) => prev ? `${prev} ${text}` : text)}
            mode="continuous"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="chat-send"
          >
            <Icon name="send" size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}
