import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore, type Material } from "../../stores/materials";
import { useUiStore } from "../../stores/ui";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdvisorDemo } from "../../hooks/useAdvisorDemo";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";
import { VoiceButton } from "../../components/VoiceButton";
import { ADVISOR_SUGGESTIONS } from "../../data/advisorSuggestions";

export function SearchBar() {
  const { t } = useTranslation();
  const searchQuery = useMaterialsStore((s) => s.searchQuery);
  const setSearchQuery = useMaterialsStore((s) => s.setSearchQuery);
  const setSearchResults = useMaterialsStore((s) => s.setSearchResults);
  const setSearchPending = useMaterialsStore((s) => s.setSearchPending);
  const scopeFilter = useMaterialsStore((s) => s.scopeFilter);
  const language = useUiStore((s) => s.language);
  const mode = useUiStore((s) => s.mode);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const debouncedQuery = useDebounce(localQuery, 300);
  const wrapRef = useRef<HTMLDivElement>(null);

  const advisor = useAdvisorDemo();

  /* Reset local query when advisor mode turns OFF */
  useEffect(() => {
    if (mode !== "advisor") {
      setLocalQuery("");
      setFocused(false);
    }
  }, [mode]);

  /* Sync debounced query to store */
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  /* Search API call */
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSearchResults(null);
      return;
    }
    const ac = new AbortController();
    setSearchPending(true);
    const params = new URLSearchParams({ q: debouncedQuery, language });
    if (scopeFilter !== "all") params.set("scope", scopeFilter);

    apiFetch<Material[]>(`/api/v1/search?${params}`, { signal: ac.signal })
      .then((data) => { if (!ac.signal.aborted) setSearchResults(data); })
      .catch((err) => { if (err?.name !== "AbortError" && !ac.signal.aborted) setSearchResults(null); })
      .finally(() => { if (!ac.signal.aborted) setSearchPending(false); });

    return () => { ac.abort(); };
  }, [debouncedQuery, scopeFilter, language, setSearchResults, setSearchPending]);

  /* Close suggestions on outside click */
  useEffect(() => {
    if (!focused) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [focused]);

  const isAdvisor = mode === "advisor";
  const suggestions = ADVISOR_SUGGESTIONS;
  const showSuggestions = isAdvisor && focused && !localQuery.trim() && !advisor.advisorAnswer;

  function handleSuggestionClick(suggestionKey: string) {
    setLocalQuery(t(suggestionKey));
    setFocused(false);
    advisor.handleSuggestionClick(suggestionKey);
  }

  function clearAll() {
    advisor.clearAdvisor();
    setLocalQuery("");
    setSearchQuery("");
  }

  return (
    <div className="search-bar-wrap" ref={wrapRef}>
      <div className={`search-bar${isAdvisor ? " search-bar--advisor" : ""}`}>
        <Icon name={isAdvisor ? "sparkles" : "search"} size={16} />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => { setLocalQuery(e.target.value); if (advisor.advisorAnswer) clearAll(); }}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearchQuery(localQuery); setFocused(false); } }}
          placeholder={isAdvisor ? t("advisor_search_placeholder", "Спросите советника...") : t("materials_search_placeholder")}
        />
        {(localQuery || advisor.advisorAnswer) && (
          <button type="button" className="search-bar-clear" onClick={clearAll} aria-label={t("clear", "Очистить")}>
            <Icon name="x" size={14} />
          </button>
        )}
        <VoiceButton onTranscript={(text) => setLocalQuery(text)} mode="single" />
        <button type="button" className="search-bar-submit" onClick={() => { setSearchQuery(localQuery); setFocused(false); }} aria-label={t("search", "Поиск")}>
          <Icon name="arrow-right" size={16} />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="advisor-suggestions">
          <div className="advisor-suggestions-header">
            <Icon name="sparkles" size={14} />
            <span>{t("advisor_suggestions_title", "Советник подскажет")}</span>
          </div>
          <div className="advisor-suggestions-list">
            {suggestions.map((s) => (
              <button key={s.key} type="button" className="advisor-suggestion-item" onClick={() => handleSuggestionClick(s.key)}>
                <span className="advisor-suggestion-icon"><Icon name={s.icon} size={15} /></span>
                <span className="advisor-suggestion-text">{t(s.key)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advisor loading */}
      {advisor.answerLoading && (
        <div className="advisor-answer">
          <div className="advisor-answer-loading">
            <Icon name="sparkles" size={16} />
            <span>{t("advisor_thinking", "Анализирую кейсы...")}</span>
            <span className="advisor-dots"><span /><span /><span /></span>
          </div>
        </div>
      )}

      {/* Advisor inline answer */}
      {advisor.advisorAnswer && !advisor.answerLoading && (
        <div className="advisor-answer">
          <div className="advisor-answer-head">
            <Icon name="sparkles" size={16} />
            <span className="advisor-answer-title">{advisor.advisorAnswer.title}</span>
            <span className="advisor-answer-badge">{advisor.advisorAnswer.caseCount} {t("advisor_cases", "кейсов")}</span>
            <button type="button" className="advisor-action-btn" onClick={advisor.copyAll} title={t("copy_all", "Скопировать всё")}>
              <Icon name="clipboard" size={14} />
            </button>
            <button type="button" className="advisor-answer-close" onClick={clearAll}>
              <Icon name="x" size={14} />
            </button>
          </div>
          <p className="advisor-answer-summary">{advisor.advisorAnswer.summary}</p>
          <div className="advisor-answer-cards">
            {advisor.advisorAnswer.points.map((point, i) => (
              <div key={i} className={`advisor-insight-card${i < advisor.visiblePoints ? " visible" : ""}`}>
                <div className="advisor-insight-top">
                  <span className="advisor-point-num">{i + 1}</span>
                  <h4 className="advisor-insight-heading">{point.heading}</h4>
                  {point.tag && <span className="advisor-insight-tag">{point.tag}</span>}
                </div>
                <p className="advisor-insight-body">{point.body}</p>
                <div className="advisor-insight-footer">
                  {point.metric && (
                    <div className="advisor-insight-metric">
                      <Icon name="trending-up" size={13} />
                      <span>{point.metric}</span>
                    </div>
                  )}
                  <div className="advisor-insight-actions">
                    <button type="button" className="advisor-action-btn" onClick={() => advisor.copyText(`${point.heading}\n${point.body}${point.metric ? `\n→ ${point.metric}` : ""}`)} title={t("copy", "Скопировать")}>
                      <Icon name="clipboard" size={12} />
                    </button>
                    <button type="button" className="advisor-action-btn" onClick={() => advisor.openCase(i)} title={t("advisor_open_case", "Открыть кейс")}>
                      <Icon name="external-link" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {advisor.visiblePoints > advisor.advisorAnswer.points.length && (
            <>
              <div className="advisor-answer-footer">
                <div className="advisor-answer-source">
                  <Icon name="info" size={12} />
                  <span>{advisor.advisorAnswer.source}</span>
                </div>
                <div className="advisor-feedback">
                  <span className="advisor-feedback-label">{t("advisor_helpful", "Полезно?")}</span>
                  <button type="button" className={`advisor-feedback-btn${advisor.feedback === "up" ? " active-up" : ""}`} onClick={() => advisor.giveFeedback("up")}>
                    <Icon name="thumbs-up" size={14} />
                  </button>
                  <button type="button" className={`advisor-feedback-btn${advisor.feedback === "down" ? " active-down" : ""}`} onClick={() => advisor.giveFeedback("down")}>
                    <Icon name="thumbs-down" size={14} />
                  </button>
                </div>
              </div>

              <div className="advisor-followup">
                <Icon name="message-circle" size={14} />
                <input
                  type="text"
                  value={advisor.followUp}
                  onChange={(e) => advisor.setFollowUp(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") advisor.handleFollowUp(); }}
                  placeholder={t("advisor_followup_placeholder", "Задать уточняющий вопрос...")}
                  className="advisor-followup-input"
                />
                <button type="button" className="advisor-followup-send" onClick={advisor.handleFollowUp} disabled={!advisor.followUp.trim()}>
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
