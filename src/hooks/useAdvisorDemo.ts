import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/ui";
import { useToastStore } from "../components/Toast";
import { useMaterialsStore } from "../stores/materials";
import { useModalStore } from "../stores/modal";
import type { AdvisorResponse } from "../data/demoResponses";
import { getDemoResponse } from "../data/demoResponses";

export function useAdvisorDemo() {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);
  const mode = useUiStore((s) => s.mode);
  const setAdvisorActive = useUiStore((s) => s.setAdvisorActive);
  const toast = useToastStore();

  const [advisorAnswer, setAdvisorAnswer] = useState<AdvisorResponse | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [visiblePoints, setVisiblePoints] = useState(0);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [followUp, setFollowUp] = useState("");

  /* Reset everything when advisor mode is turned OFF */
  useEffect(() => {
    if (mode !== "advisor") {
      setAdvisorAnswer(null);
      setAnswerLoading(false);
      setVisiblePoints(0);
      setFeedback(null);
      setFollowUp("");
    }
  }, [mode]);

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

  const handleSuggestionClick = useCallback((suggestionKey: string) => {
    const demo = getDemoResponse(suggestionKey, language);
    if (demo) {
      setAnswerLoading(true);
      setAdvisorActive(true);
      setAdvisorAnswer(null);
      setVisiblePoints(0);
      setFeedback(null);
      setTimeout(() => {
        setAnswerLoading(false);
        setAdvisorAnswer(demo);
      }, 1200);
    }
  }, [language, setAdvisorActive]);

  const handleFollowUp = useCallback(() => {
    if (!followUp.trim()) return;
    setAnswerLoading(true);
    setAdvisorActive(true);
    const prevAnswer = advisorAnswer;
    setAdvisorAnswer(null);
    setVisiblePoints(0);
    setFeedback(null);
    setTimeout(() => {
      setAnswerLoading(false);
      if (prevAnswer) {
        setAdvisorAnswer({
          ...prevAnswer,
          title: `${prevAnswer.title} — ${t("advisor_followup_label", "уточнение")}`,
          summary: `${t("advisor_followup_prefix", "По вашему вопросу")} «${followUp}»: ${prevAnswer.summary}`,
        });
      }
      setFollowUp("");
    }, 1500);
  }, [followUp, advisorAnswer, setAdvisorActive, t]);

  const clearAdvisor = useCallback(() => {
    setAdvisorAnswer(null);
    setAnswerLoading(false);
    setAdvisorActive(false);
    setVisiblePoints(0);
    setFeedback(null);
    setFollowUp("");
  }, [setAdvisorActive]);

  const giveFeedback = useCallback((type: "up" | "down") => {
    setFeedback(type);
    toast.show(
      type === "up" ? t("advisor_thanks", "Спасибо за отзыв!") : t("advisor_improve", "Учтём, спасибо!"),
      type === "up" ? "success" : "info",
    );
  }, [t, toast]);

  const openCase = useCallback((index: number) => {
    const m = useMaterialsStore.getState().materials[index];
    if (m) {
      useModalStore.getState().openModal(m);
    } else {
      toast.show(t("advisor_no_case", "Кейс недоступен в демо"), "info");
    }
  }, [t, toast]);

  return {
    advisorAnswer,
    answerLoading,
    visiblePoints,
    feedback,
    followUp,
    setFollowUp,
    copyText,
    copyAll,
    handleSuggestionClick,
    handleFollowUp,
    clearAdvisor,
    giveFeedback,
    openCase,
  };
}
