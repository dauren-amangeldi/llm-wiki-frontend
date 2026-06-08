import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useUiStore } from "../../stores/ui";
import { Icon } from "../../components/Icon";
import { VoiceButton } from "../../components/VoiceButton";
import { useSSEStream } from "../../hooks/useSSEStream";

interface Source {
  title: string;
  content_type?: string;
  path?: string;
}

export function AdvisorPanel() {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const { start, abort, isStreaming } = useSSEStream();

  const handleSubmit = useCallback(async () => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    abort();
    setAnswer("");
    setSources([]);

    let accumulated = "";
    await start("/api/advisor/ask", { query: trimmed, language }, {
      onToken: (token) => {
        accumulated += token;
        setAnswer(accumulated);
      },
      onDone: (data) => {
        if (data.answer) setAnswer(data.answer as string);
        if (data.sources) setSources(data.sources as Source[]);
      },
      onError: (error) => {
        setAnswer(error || t("advisor.error", "Something went wrong"));
      },
    });
  }, [question, isStreaming, language, start, abort, t]);

  return (
    <div className="advisor-panel">
      <div className="advisor-input-wrap">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("advisor.placeholder", "Ask a question...")}
          rows={3}
          className="advisor-textarea"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <VoiceButton
          onTranscript={(text) => setQuestion((prev) => prev ? `${prev} ${text}` : text)}
          mode="continuous"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isStreaming || !question.trim()}
          className="advisor-submit"
        >
          {isStreaming ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="send" size={16} />}
          {t("advisor.submit", "Ask")}
        </button>
      </div>

      <div className="advisor-results">
        {isStreaming && !answer && (
          <div className="loading-center">
            <Icon name="loader" size={20} className="animate-spin" />
          </div>
        )}

        {answer && (
          <div className="prose">
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        )}

        {sources.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="advisor-sources-label">{t("advisor.sources", "Sources")}</div>
            {sources.map((src, idx) => (
              <div key={idx} className="advisor-source-item">
                <Icon name="file-text" size={14} />
                <span className="search-result-title" style={{ flex: 1 }}>{src.title}</span>
                {src.content_type && (
                  <span className="search-result-badge">{src.content_type}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
