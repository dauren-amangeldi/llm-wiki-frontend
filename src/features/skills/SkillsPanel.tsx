import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/client";
import { useUiStore } from "../../stores/ui";
import { useToastStore } from "../../components/Toast";
import { Icon } from "../../components/Icon";
import { CardSkeleton } from "../../components/Skeleton";

/** Extract the mode key from a skill slug like "modes/expert" → "expert" */
function slugToMode(slug: string): string | null {
  if (!slug.startsWith("modes/")) return null;
  return slug.slice("modes/".length);
}

interface Skill {
  slug: string;
  name: string;
  content: string;
}

const SKILL_META: Record<string, { icon: string; descKey: string; color: string }> = {
  "modes/advisor":        { icon: "sparkles",       descKey: "skill_desc_advisor",  color: "#6366f1" },
  "modes/expert":         { icon: "brain",          descKey: "skill_desc_expert",   color: "#8b5cf6" },
  "modes/library":        { icon: "book-open",      descKey: "skill_desc_library",  color: "#0ea5e9" },
  "positions/employee":   { icon: "user",           descKey: "skill_desc_employee", color: "#10b981" },
  "positions/finance":    { icon: "bar-chart-2",    descKey: "skill_desc_finance",  color: "#f59e0b" },
  "positions/gd":         { icon: "crown",          descKey: "skill_desc_gd",       color: "#ef4444" },
  "positions/hr":         { icon: "users",          descKey: "skill_desc_hr",       color: "#ec4899" },
  "positions/legal":      { icon: "scale",          descKey: "skill_desc_legal",    color: "#64748b" },
  "positions/pm":         { icon: "clipboard-list", descKey: "skill_desc_pm",       color: "#14b8a6" },
  "positions/pto":        { icon: "settings",       descKey: "skill_desc_pto",      color: "#f97316" },
};

function metaForSlug(slug: string) {
  return SKILL_META[slug] || { icon: "zap", descKey: "", color: "#6366f1" };
}

export function SkillsPanel() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToastStore();
  const currentMode = useUiStore((s) => s.mode);

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Skill[]>("/api/v1/skills");
      setSkills(data);
    } catch {
      setError(t("load_error", "Не удалось загрузить данные"));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!editing) return;
    try {
      await apiFetch(`/api/v1/skills/${editing.slug}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      toast.show(t("skill_saved", "Скилл сохранён"), "success");
      setEditing(null);
      loadSkills();
    } catch {
      toast.show(t("save_error", "Не удалось сохранить"), "error");
    }
  }

  if (editing) {
    return (
      <div className="workspace-panel">
        <div className="skill-editor-head">
          <button
            className="icon-button"
            onClick={() => setEditing(null)}
            aria-label={t("back")}
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <div>
            <h2 className="skill-editor-title">{editing.name}</h2>
            <span className="skill-card-slug">{editing.slug}</span>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="skill-editor-area"
        />

        <div className="skill-editor-actions">
          <button onClick={save} className="btn btn-primary">
            <Icon name="check" size={18} />
            {t("save_button", "Сохранить")}
          </button>
          <button onClick={() => setEditing(null)} className="btn btn-outline">
            {t("cancel_button", "Отмена")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-panel">
      <h2 className="skill-editor-title">{t("skills_title", "Управление скиллами")}</h2>
      <p className="panel-subtitle">{t("skills_desc", "Настройте поведение AI-режимов для вашей команды")}</p>

      {loading && (
        <div className="skills-grid">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}
      {error && (
        <p style={{ color: "var(--danger)", fontSize: "var(--font-sm)" }}>{error}</p>
      )}
      {!loading && !error && <div className="skills-grid">
        {skills.map((s) => {
          const meta = metaForSlug(s.slug);
          const modeKey = slugToMode(s.slug);
          const isActive = modeKey === currentMode;
          return (
            <button
              key={s.slug}
              className={`skill-card${isActive ? " is-active" : ""}`}
              style={{ "--skill-color": meta.color } as React.CSSProperties}
              onClick={() => { setEditing(s); setContent(s.content); }}
            >
              <div className="skill-card-accent" />
              <div className="skill-card-head">
                <div className="skill-card-icon">
                  <Icon name={meta.icon} size={20} />
                </div>
                <div className="skill-card-head-text">
                  <div className="skill-card-title">{s.name}</div>
                  <div className="skill-card-category">
                    {s.slug.startsWith("modes/") ? t("skill_type_mode", "Режим") : t("skill_type_position", "Позиция")}
                  </div>
                </div>
                <Icon name="chevron-right" size={16} className="skill-card-arrow" />
              </div>
              {meta.descKey && (
                <div className="skill-card-desc">{t(meta.descKey)}</div>
              )}
            </button>
          );
        })}
      </div>}
    </div>
  );
}
