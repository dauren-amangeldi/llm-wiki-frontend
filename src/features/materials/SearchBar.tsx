import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMaterialsStore } from "../../stores/materials";
import { useUiStore } from "../../stores/ui";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdvisor } from "../../hooks/useAdvisor";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";
import { VoiceButton } from "../../components/VoiceButton";
import { ADVISOR_SUGGESTIONS } from "../../data/advisorSuggestions";

interface WikiSearchHit {
  slug: string;
  title: string;
  snippet: string;
  scope: string;
}

export function SearchBar() {
  const { t } = useTranslation();
  const searchQuery = useMaterialsStore((s) => s.searchQuery);
  const setSearchQuery = useMaterialsStore((s) => s.setSearchQuery);
  const setSearchPending = useMaterialsStore((s) => s.setSearchPending);
  const scopeFilter = useMaterialsStore((s) => s.scopeFilter);
  const language = useUiStore((s) => s.language);
  const mode = useUiStore((s) => s.mode);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const [wikiResults, setWikiResults] = useState<WikiSearchHit[]>([]);
  const debouncedQuery = useDebounce(localQuery, 300);
  const wrapRef = useRef<HTMLDivElement>(null);

  const advisor = useAdvisor();
  const isAdvisor = mode === "advisor";

  function submitSearch() {
    setSearchQuery(localQuery);
    setFocused(false);
    if (isAdvisor && localQuery.trim().length >= 3) {
      advisor.askQuery(localQuery.trim());
    }
  }

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

  /* Lexical FTS search — only when advisor is OFF (LW-N6) */
  useEffect(() => {
    if (isAdvisor) return;
    if (debouncedQuery.length < 3) {
      setWikiResults([]);
      setSearchPending(false);
      return;
    }
    const ac = new AbortController();
    setSearchPending(true);
    const params = new URLSearchParams({ q: debouncedQuery, language });
    if (scopeFilter !== "all") params.set("scope", scopeFilter);

    apiFetch<WikiSearchHit[]>(`/api/v1/search?${params}`, { signal: ac.signal })
      .then((data) => { if (!ac.signal.aborted) setWikiResults(data ?? []); })
      .catch((err) => {
        if (err?.name !== "AbortError" && !ac.signal.aborted) setWikiResults([]);
      })
      .finally(() => { if (!ac.signal.aborted) setSearchPending(false); });

    return () => { ac.abort(); };
  }, [debouncedQuery, scopeFilter, language, isAdvisor, setSearchPending]);

  /* Close suggestions on outside click */
  useEffect(() => {
    if (!focused) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [focused]);

  const suggestions = ADVISOR_SUGGESTIONS;
  const showSuggestions = isAdvisor && focused && !localQuery.trim() && !advisor.advisorAnswer && !advisor.refusalMessage;
  const showWikiResults = !isAdvisor && focused && debouncedQuery.length >= 3;

  function openWikiResult(slug: string) {
    setActiveTab("wiki");
    window.history.pushState({}, "", `?tab=wiki&slug=${encodeURIComponent(slug)}`);
    setFocused(false);
  }

  function stripMarkup(html: string): string {
    return html.replace(/<\/?mark>/g, "");
  }

  function handleSuggestionClick(suggestionKey: string) {
    setLocalQuery(t(suggestionKey));
    setFocused(false);
    advisor.handleSuggestionClick(suggestionKey);
  }

  function clearAll() {
    advisor.clearAdvisor();
    setLocalQuery("");
    setSearchQuery("");
    setWikiResults([]);
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
          onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
          placeholder={isAdvisor ? t("advisor_search_placeholder", "Спросите советника...") : t("materials_search_placeholder")}
        />
        {(localQuery || advisor.advisorAnswer) && (
          <button type="button" className="search-bar-clear" onClick={clearAll} aria-label={t("clear", "Очистить")}>
            <Icon name="x" size={14} />
          </button>
        )}
        <VoiceButton onTranscript={(text) => setLocalQuery(text)} mode="single" />
        <button type="button" className="search-bar-submit" onClick={submitSearch} aria-label={t("search", "Поиск")}>
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

      {/* FTS keyword results — advisor OFF only */}
      {showWikiResults && (
        <div className="search-fts-results">
          {wikiResults.length === 0 ? (
            <div className="search-fts-empty">{t("search_no_results", "Ничего не найдено")}</div>
          ) : (
            wikiResults.map((hit) => (
              <button
                key={hit.slug}
                type="button"
                className="search-fts-item"
                onClick={() => openWikiResult(hit.slug)}
              >
                <Icon name="file-text" size={16} />
                <div className="search-fts-body">
                  <div className="search-fts-title">{hit.title}</div>
                  <div className="search-fts-snippet">{stripMarkup(hit.snippet)}</div>
                </div>
                <span className="search-fts-badge">{hit.scope}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Advisor refusal */}
      {advisor.refusalMessage && !advisor.answerLoading && (
        <div className="advisor-answer">
          <div className="refusal-box">
            <span className="refusal-icon"><Icon name="search-x" size={20} /></span>
            <div>{advisor.refusalMessage}</div>
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
                    <button type="button" className="advisor-action-btn" onClick={() => point.case_id && advisor.openCase(point.case_id)} title={t("advisor_open_case", "Открыть кейс")}>
                      <Icon name="external-link" size={12} />
                    </button>
                    <button type="button" className="advisor-action-btn" onClick={() => point.case_id && advisor.openInNotebook(point.case_id, point.heading)} title={t("advisor_open_notebook", "В ноутбук")}>
                      <Icon name="book" size={12} />
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
