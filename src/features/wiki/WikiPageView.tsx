import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";

interface WikiPageDetail {
  slug: string;
  title: string;
  content: string;
  size_chars: number;
  updated_at: string;
  backlinks: string[];
}

interface Props {
  slug: string;
  onBack: () => void;
  onNavigate: (slug: string) => void;
}

export function WikiPageView({ slug, onBack, onNavigate }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState<WikiPageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<WikiPageDetail>(`/api/v1/wiki/${slug}/full`, { signal: ac.signal })
      .then((data) => { setPage(data); setLoading(false); })
      .catch((e: Error) => {
        if (!ac.signal.aborted) {
          setError(e?.message || "Ошибка загрузки");
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, [slug]);

  const preprocessed = page
    ? page.content.replace(
        /\[\[([a-z0-9][a-z0-9-]*)\]\]/g,
        (_, s: string) => `[${s}](#wiki-link-${s})`,
      )
    : "";

  return (
    <div className="wiki-page-view">
      <div className="wiki-page-header">
        <button type="button" className="wiki-back-btn" onClick={onBack}>
          <Icon name="chevron-left" size={16} /> {t("wiki_back", "К списку")}
        </button>
        {page && (
          <div className="wiki-page-meta">
            <span><code>{page.slug}.md</code></span>
            <span>·</span>
            <span>{new Date(page.updated_at).toLocaleString()}</span>
            <span>·</span>
            <span>{page.size_chars} симв.</span>
          </div>
        )}
      </div>

      {loading && <div className="wiki-loading">{t("loading", "Загрузка...")}</div>}
      {error && <div className="wiki-error">{error}</div>}

      {page && (
        <>
          <article className="wiki-page-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  if (href?.startsWith("#wiki-link-")) {
                    const targetSlug = href.replace("#wiki-link-", "");
                    return (
                      <button
                        type="button"
                        className="wiki-inline-link"
                        onClick={(e) => { e.preventDefault(); onNavigate(targetSlug); }}
                      >
                        [[{targetSlug}]]
                      </button>
                    );
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {preprocessed}
            </ReactMarkdown>
          </article>

          {page.backlinks.length > 0 && (
            <aside className="wiki-backlinks">
              <h3>{t("wiki_backlinks", "На эту страницу ссылаются")}</h3>
              <ul>
                {page.backlinks.map((b) => (
                  <li key={b}>
                    <button
                      type="button"
                      onClick={() => onNavigate(b)}
                      className="wiki-inline-link"
                    >
                      [[{b}]]
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </>
      )}
    </div>
  );
}
