import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/client";
import { useNotebooksStore } from "../../stores/notebooks";
import { useToastStore } from "../../components/Toast";
import { Icon } from "../../components/Icon";
import { CardSkeleton } from "../../components/Skeleton";
import { NotebookView } from "./NotebookView";

export function NotebooksPanel() {
  const { t } = useTranslation();
  const toast = useToastStore();
  const notebooks = useNotebooksStore((s) => s.notebooks);
  const activeId = useNotebooksStore((s) => s.activeNotebookId);
  const loading = useNotebooksStore((s) => s.loading);
  const setNotebooks = useNotebooksStore((s) => s.setNotebooks);
  const setActiveNotebookId = useNotebooksStore((s) => s.setActiveNotebookId);
  const setLoading = useNotebooksStore((s) => s.setLoading);
  const removeNotebook = useNotebooksStore((s) => s.removeNotebook);
  const upsertNotebook = useNotebooksStore((s) => s.upsertNotebook);

  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

  const loadNotebooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<typeof notebooks>("/api/v1/notebooks");
      setNotebooks(data ?? []);
    } catch {
      toast.show(t("load_error", "Не удалось загрузить данные"), "error");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setNotebooks, t, toast]);

  useEffect(() => { void loadNotebooks(); }, [loadNotebooks]);

  const activeNotebook = notebooks.find((n) => n.id === activeId) ?? null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const nb = await apiFetch<typeof activeNotebook>("/api/v1/notebooks", {
        method: "POST",
        body: JSON.stringify({ title: trimmed }),
      });
      if (nb) {
        upsertNotebook(nb);
        setActiveNotebookId(nb.id);
      }
      setTitle("");
      setCreating(false);
    } catch {
      toast.show(t("create_error", "Не удалось создать"), "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/v1/notebooks/${id}`, { method: "DELETE" });
      removeNotebook(id);
    } catch {
      toast.show(t("delete_error", "Не удалось удалить"), "error");
    }
  }

  if (activeNotebook) {
    return (
      <NotebookView
        notebook={activeNotebook}
        onBack={() => setActiveNotebookId(null)}
        onRefresh={loadNotebooks}
      />
    );
  }

  return (
    <div className="workspace-panel">
      <div className="notebook-list-head">
        <div>
          <h2 className="skill-editor-title">{t("notebooks_title", "Ноутбуки")}</h2>
          <p className="panel-subtitle">
            {t("notebooks_desc", "Личные рабочие окна с источниками — без изменения глобальной базы")}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <Icon name="plus" size={16} />
          {t("notebook_create", "Новый ноутбук")}
        </button>
      </div>

      {creating && (
        <form className="notebook-create-form" onSubmit={handleCreate}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("notebook_title_placeholder", "Название ноутбука")}
            className="field-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">{t("create", "Создать")}</button>
          <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>
            {t("cancel_button", "Отмена")}
          </button>
        </form>
      )}

      {loading && (
        <div className="skills-grid">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {!loading && (
        <div className="notebook-list">
          {notebooks.length === 0 ? (
            <p className="notebook-list-empty">{t("notebooks_empty", "Пока нет ноутбуков")}</p>
          ) : (
            notebooks.map((nb) => (
              <div key={nb.id} className="notebook-list-item">
                <button
                  type="button"
                  className="notebook-list-open"
                  onClick={() => setActiveNotebookId(nb.id)}
                >
                  <Icon name="book" size={20} />
                  <div>
                    <div className="notebook-list-title">{nb.title}</div>
                    <div className="notebook-list-meta">
                      {t("notebook_subtitle", "{{count}} источников", { count: nb.files.length })}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button notebook-list-delete"
                  onClick={() => void handleDelete(nb.id)}
                  aria-label={t("delete", "Удалить")}
                >
                  <Icon name="trash-2" size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
