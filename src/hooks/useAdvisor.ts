import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/ui";
import { useAuthStore } from "../stores/auth";
import { useToastStore } from "../components/Toast";
import { useMaterialsStore } from "../stores/materials";
import { useNotebooksStore, type Notebook } from "../stores/notebooks";
import { useModalStore } from "../stores/modal";
import { useSSEStream } from "./useSSEStream";
import { apiFetch } from "../api/client";
import type { AdvisorResponse } from "../data/demoResponses";

interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

function parseAdvisorDone(data: Record<string, unknown>): AdvisorResponse | null {
  if (data.refusal) return null;
  if (!data.title || !Array.isArray(data.points)) return null;
  return {
    title: String(data.title),
    summary: String(data.summary ?? ""),
    points: (data.points as Record<string, unknown>[]).map((p) => ({
      heading: String(p.heading ?? ""),
      body: String(p.body ?? ""),
      metric: p.metric ? String(p.metric) : undefined,
      tag: p.tag ? String(p.tag) : undefined,
      case_id: p.case_id ? String(p.case_id) : undefined,
    })),
    source: String(data.source ?? ""),
    caseCount: Number(data.caseCount ?? 0),
  };
}

export function useAdvisor() {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);
  const mode = useUiStore((s) => s.mode);
  const userPosition = useUiStore((s) => s.userPosition);
  const scopeFilter = useMaterialsStore((s) => s.scopeFilter);
  const session = useAuthStore((s) => s.session);
  const setAdvisorActive = useUiStore((s) => s.setAdvisorActive);
  const toast = useToastStore();
  const { start, abort, isStreaming } = useSSEStream();

  const [advisorAnswer, setAdvisorAnswer] = useState<AdvisorResponse | null>(null);
  const [refusalMessage, setRefusalMessage] = useState<string | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [visiblePoints, setVisiblePoints] = useState(0);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [followUp, setFollowUp] = useState("");
  const historyRef = useRef<HistoryTurn[]>([]);

  /* Reset when advisor mode turns OFF */
  useEffect(() => {
    if (mode !== "advisor") {
      setAdvisorAnswer(null);
      setRefusalMessage(null);
      setAnswerLoading(false);
      setVisiblePoints(0);
      setFeedback(null);
      setFollowUp("");
      historyRef.current = [];
      abort();
    }
  }, [mode, abort]);

  /* Stagger-reveal answer points */
  useEffect(() => {
    if (!advisorAnswer) { setVisiblePoints(0); return; }
    if (visiblePoints >= advisorAnswer.points.length + 1) return;
    const timer = setTimeout(() => setVisiblePoints((v) => v + 1), 400);
    return () => clearTimeout(timer);
  }, [advisorAnswer, visiblePoints]);

  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.show(t("copied", "Скопировано"), "success");
    });
  }, [t, toast]);

  const copyAll = useCallback(() => {
    if (!advisorAnswer) return;
    const lines = [
      advisorAnswer.title, "",
      advisorAnswer.summary, "",
      ...advisorAnswer.points.map((p, i) =>
        `${i + 1}. ${p.heading}\n${p.body}${p.metric ? `\n→ ${p.metric}` : ""}`
      ),
      "", advisorAnswer.source,
    ];
    copyText(lines.join("\n"));
  }, [advisorAnswer, copyText]);

  const runQuery = useCallback(async (query: string, history?: HistoryTurn[]) => {
    const trimmed = query.trim();
    if (!trimmed || isStreaming) return;

    abort();
    setAnswerLoading(true);
    setAdvisorActive(true);
    setAdvisorAnswer(null);
    setRefusalMessage(null);
    setVisiblePoints(0);
    setFeedback(null);

    const role = userPosition || session?.role || "employee";

    await start(
      "/api/v1/advisor",
      {
        query: trimmed,
        role,
        language,
        scope: scopeFilter,
        history: history ?? historyRef.current,
      },
      {
        onDone: (data) => {
          setAnswerLoading(false);
          if (data.refusal) {
            setRefusalMessage(
              (data.refusal_message as string) || t("refusal_message"),
            );
            setAdvisorAnswer(null);
            return;
          }
          const parsed = parseAdvisorDone(data);
          if (!parsed) {
            toast.show(t("advisor_error", "Не удалось получить ответ"), "error");
            return;
          }
          setAdvisorAnswer(parsed);
          historyRef.current = [
            ...(history ?? historyRef.current),
            { role: "user", content: trimmed },
            { role: "assistant", content: `${parsed.title}\n${parsed.summary}` },
          ];
        },
        onError: (error) => {
          setAnswerLoading(false);
          toast.show(error || t("advisor_error", "Не удалось получить ответ"), "error");
        },
      },
    );
  }, [
    abort, isStreaming, language, scopeFilter, session?.role, setAdvisorActive,
    start, t, toast, userPosition,
  ]);

  const askQuery = useCallback((query: string) => {
    historyRef.current = [];
    void runQuery(query, []);
  }, [runQuery]);

  const handleSuggestionClick = useCallback((suggestionKey: string) => {
    const text = t(suggestionKey);
    if (text) askQuery(text);
  }, [askQuery, t]);

  const handleFollowUp = useCallback(() => {
    if (!followUp.trim()) return;
    const q = followUp.trim();
    setFollowUp("");
    void runQuery(q);
  }, [followUp, runQuery]);

  const clearAdvisor = useCallback(() => {
    abort();
    setAdvisorAnswer(null);
    setRefusalMessage(null);
    setAnswerLoading(false);
    setAdvisorActive(false);
    setVisiblePoints(0);
    setFeedback(null);
    setFollowUp("");
    historyRef.current = [];
  }, [abort, setAdvisorActive]);

  const giveFeedback = useCallback((type: "up" | "down") => {
    setFeedback(type);
    toast.show(
      type === "up" ? t("advisor_thanks", "Спасибо за отзыв!") : t("advisor_improve", "Учтём, спасибо!"),
      type === "up" ? "success" : "info",
    );
  }, [t, toast]);

  const openCase = useCallback((caseId: string) => {
    const materials = useMaterialsStore.getState().materials;
    const m = materials.find((x) => x.document_id === caseId);
    if (m) {
      useModalStore.getState().openModal(m);
    } else {
      toast.show(t("advisor_no_case", "Кейс недоступен"), "info");
    }
  }, [t, toast]);

  const openInNotebook = useCallback(async (caseId: string, caseTitle?: string) => {
    try {
      const title = caseTitle || t("notebook_from_case", "Кейс из советника");
      const created = await apiFetch<Notebook>("/api/v1/notebooks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      const attached = await apiFetch<Notebook>(`/api/v1/notebooks/${created.id}/attach`, {
        method: "POST",
        body: JSON.stringify({ file_id: caseId }),
      });
      useNotebooksStore.getState().upsertNotebook(attached);
      useNotebooksStore.getState().setActiveNotebookId(attached.id);
      useUiStore.getState().setActiveTab("notebooks");
      window.history.pushState({}, "", "?tab=notebooks");
      toast.show(t("notebook_opened", "Ноутбук создан"), "success");
    } catch {
      toast.show(t("notebook_open_error", "Не удалось открыть ноутбук"), "error");
    }
  }, [t, toast]);

  return {
    advisorAnswer,
    refusalMessage,
    answerLoading: answerLoading || isStreaming,
    visiblePoints,
    feedback,
    followUp,
    setFollowUp,
    copyText,
    copyAll,
    askQuery,
    handleSuggestionClick,
    handleFollowUp,
    clearAdvisor,
    giveFeedback,
    openCase,
    openInNotebook,
  };
}
