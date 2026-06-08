import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/auth";
import { useUiStore } from "../../stores/ui";
import { useMaterialsStore, type Material } from "../../stores/materials";
import { apiFetch } from "../../api/client";
import { useModalStore } from "../../stores/modal";
import { Icon } from "../../components/Icon";
import { VoiceButton } from "../../components/VoiceButton";
import { pruneLocalStorage } from "../../lib/storage-cleanup";
import { MetricsSection } from "./MetricsSection";
import { contentTypeIcon } from "../../lib/icons";
import { formatDate } from "../../lib/format";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "dashboard_greeting_night";
  if (h < 12) return "dashboard_greeting_morning";
  if (h < 18) return "dashboard_greeting_afternoon";
  return "dashboard_greeting_evening";
}

function getFirstName(email: string): string {
  const name = email.split("@")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function DashboardPanel() {
  const { t } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const language = useUiStore((s) => s.language);
  const materials = useMaterialsStore((s) => s.materials);
  const setMaterials = useMaterialsStore((s) => s.setMaterials);

  // Prune stale localStorage on dashboard load
  useEffect(() => { pruneLocalStorage(); }, []);

  // Load materials if not yet loaded
  useEffect(() => {
    if (materials.length > 0) return;
    const ac = new AbortController();
    apiFetch<Material[]>("/api/v1/documents", { signal: ac.signal })
      .then((docs) => { if (!ac.signal.aborted) setMaterials(docs); })
      .catch(() => {});
    return () => { ac.abort(); };
  }, [materials.length, setMaterials]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<{ title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Get recent materials (last 5 viewed from query_logs would be ideal, fallback to newest)
  const recentMaterials = materials.slice(0, 4);

  async function handleAsk() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    try {
      const res = await apiFetch<{ answer: string; sources?: { title: string }[] }>("/api/v1/chat", {
        method: "POST",
        body: JSON.stringify({ question: question.trim(), language, mode: "advisor" }),
      });
      setAnswer(res.answer || "");
      setSources(res.sources || []);
    } catch {
      setAnswer(t("advisor_error", "Не удалось получить ответ"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-panel">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>{t(getGreeting())} {session ? getFirstName(session.email) : ""}</h1>
        <p className="dashboard-subtitle">{t("dashboard_subtitle", "Что вы хотите узнать сегодня?")}</p>
      </div>

      {/* Hero search */}
      <div className="dashboard-hero-search">
        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="dashboard-search-form">
          <Icon name="sparkles" size={20} />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("dashboard_search_placeholder", "Задайте вопрос по всей библиотеке знаний...")}
            disabled={loading}
            autoFocus
            className="dashboard-search-input"
          />
          <VoiceButton
            onTranscript={(text) => setQuestion((prev) => prev ? `${prev} ${text}` : text)}
            mode="continuous"
          />
          <button type="submit" disabled={loading || !question.trim()} className="dashboard-search-submit">
            {loading ? <Icon name="loader" size={18} className="animate-spin" /> : <Icon name="arrow-right" size={18} />}
          </button>
        </form>
      </div>

      {/* Answer block */}
      {answer && (
        <div className="dashboard-answer">
          <div className="dashboard-answer-text">{answer}</div>
          {sources.length > 0 && (
            <div className="dashboard-answer-sources">
              <Icon name="file-text" size={14} />
              {sources.map((s) => <span key={s.title}>{s.title}</span>)}
            </div>
          )}
        </div>
      )}

      {/* Metrics */}
      <MetricsSection />

      {/* Recent cases */}
      {recentMaterials.length > 0 && (
        <div className="dashboard-section">
          <h3 className="dashboard-section-title">{t("dashboard_recent", "Недавние кейсы")}</h3>
          <div className="dashboard-recent-grid">
            {recentMaterials.map((m) => (
              <button
                key={m.document_id}
                className="dashboard-recent-card"
                onClick={() => {
                  setActiveTab("materials");
                  setTimeout(() => useModalStore.getState().openModal(m), 100);
                }}
              >
                <div className="dashboard-recent-head">
                  <div className="material-card-icon" data-type={m.content_type?.toLowerCase()}>
                    <Icon name={contentTypeIcon(m.content_type)} size={14} />
                  </div>
                  <span className="dashboard-recent-date">{formatDate(m.created_at, language)}</span>
                </div>
                <span className="dashboard-recent-title">{m.title}</span>
                {m.tags && m.tags.length > 0 && (
                  <span className="dashboard-recent-tags">
                    {m.tags.slice(0, 2).map((tg) => tg.name).join(" · ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
