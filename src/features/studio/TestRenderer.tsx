import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

interface RawQuestion {
  question?: string;
  text?: string;
  options: (string | { id?: string; text?: string })[];
  correct: number | string;
  explanation?: string;
}

interface NormalizedQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

/** Normalize correct answer to a 0-based index regardless of LLM format. */
function normalizeCorrect(val: number | string, options: (string | { id?: string })[]): number {
  if (typeof val === "number") return val;
  const s = String(val).trim().toUpperCase();
  // Match by option id: "c" → find index of option with id="c"
  if (s.length === 1) {
    const byId = options.findIndex((o) => typeof o === "object" && o.id?.toUpperCase() === s);
    if (byId >= 0) return byId;
  }
  // "A" → 0, "B" → 1, etc.
  if (s.length === 1 && s >= "A" && s <= "Z") return s.charCodeAt(0) - 65;
  // "1" → 0 (1-based to 0-based)
  const n = parseInt(s, 10);
  if (!isNaN(n) && n >= 1 && n <= 26) return n - 1;
  return 0;
}

/** Normalize option to string */
function normalizeOption(opt: string | { id?: string; text?: string }): string {
  if (typeof opt === "string") return opt;
  return opt.text || opt.id || "";
}

export function TestRenderer({ content }: { content: unknown }) {
  const { t } = useTranslation();
  const raw = (content as { questions?: RawQuestion[] })?.questions ?? [];
  const questions: NormalizedQuestion[] = useMemo(
    () => raw.map((q) => ({
      question: q.question || q.text || "",
      options: q.options.map(normalizeOption),
      correct: normalizeCorrect(q.correct, q.options),
      explanation: q.explanation,
    })),
    [raw],
  );
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [current, setCurrent] = useState(0);

  if (!questions.length) {
    return <p className="prose-muted">{t("no_questions", "Нет вопросов")}</p>;
  }

  const total = questions.length;
  const answered = answers.size;
  const correctCount = Array.from(answers.entries()).filter(
    ([qi, oi]) => oi === questions[qi]?.correct,
  ).length;

  function selectOption(qi: number, oi: number) {
    if (answers.has(qi)) return;
    setAnswers((prev) => new Map(prev).set(qi, oi));
  }

  const q = questions[current];
  const picked = answers.get(current);
  const isAnswered = picked !== undefined;
  const allDone = answered === total;

  return (
    <div className="test-runner">
      {/* Progress bar */}
      <div className="test-progress">
        <div className="test-progress-bar">
          <div
            className="test-progress-fill"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
        <span className="test-progress-label">
          {answered}/{total}
        </span>
      </div>

      {/* Question nav dots */}
      <div className="test-dots">
        {questions.map((_, i) => {
          const a = answers.get(i);
          let cls = "test-dot";
          if (i === current) cls += " active";
          if (a !== undefined) cls += a === questions[i].correct ? " correct" : " wrong";
          return (
            <button key={i} className={cls} onClick={() => setCurrent(i)}>
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Current question */}
      <div className="test-card">
        <p className="test-card-number">
          {t("question_n", { n: current + 1, total, defaultValue: "Вопрос {{n}} из {{total}}" })}
        </p>
        <p className="test-card-text">{q.question}</p>

        <div className="test-options">
          {q.options.map((opt, oi) => {
            const cleanOpt = opt.replace(/^[A-Da-d]\.\s*/, "");
            let cls = "test-opt-btn";
            if (isAnswered) {
              if (oi === q.correct) cls += " correct";
              else if (oi === picked) cls += " wrong";
            }
            return (
              <button
                key={oi}
                className={cls}
                onClick={() => selectOption(current, oi)}
                disabled={isAnswered}
              >
                <span className="test-opt-letter">
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="test-opt-text">{cleanOpt}</span>
                {isAnswered && oi === q.correct && (
                  <Icon name="check" size={16} className="test-opt-icon correct" />
                )}
                {isAnswered && oi === picked && oi !== q.correct && (
                  <Icon name="x" size={16} className="test-opt-icon wrong" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && q.explanation && (
          <div className="test-explanation">
            <Icon name="lightbulb" size={16} />
            <p>{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="test-nav">
        <button
          className="btn btn-ghost"
          disabled={current === 0}
          onClick={() => setCurrent(current - 1)}
        >
          <Icon name="chevron-left" size={16} />
          {t("prev", "Назад")}
        </button>

        {allDone && (
          <div className="test-score">
            <Icon name="award" size={18} />
            <span>
              {correctCount}/{total} ({Math.round((correctCount / total) * 100)}%)
            </span>
          </div>
        )}

        <button
          className="btn btn-ghost"
          disabled={current === total - 1}
          onClick={() => setCurrent(current + 1)}
        >
          {t("next", "Далее")}
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}
