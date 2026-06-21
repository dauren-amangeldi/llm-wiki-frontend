import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/client";
import { useSSEStream } from "../../hooks/useSSEStream";
import { useNotebooksStore, type Notebook } from "../../stores/notebooks";
import { useUiStore } from "../../stores/ui";
import { useToastStore } from "../../components/Toast";
import { Icon } from "../../components/Icon";
import { DropZone } from "../modal/DropZone";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  refusal?: boolean;
}

interface NotebookViewProps {
  notebook: Notebook;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export function NotebookView({ notebook, onBack, onRefresh }: NotebookViewProps) {
  const { t } = useTranslation();
  const toast = useToastStore();
  const language = useUiStore((s) => s.language);
  const { start, isStreaming } = useSSEStream();
  const upsertNotebook = useNotebooksStore((s) => s.upsertNotebook);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      let latest = notebook;
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const updated = await apiFetch<Notebook>(
          `/api/v1/notebooks/${notebook.id}/files`,
          { method: "POST", body: form },
        );
        latest = updated;
        upsertNotebook(updated);
      }
      toast.show(t("sources_added", "Источники добавлены"), "success");
      await onRefresh();
    } catch {
      toast.show(t("upload_error", "Ошибка загрузки"), "error");
    } finally {
      setUploading(false);
    }
  }, [notebook, onRefresh, t, toast, upsertNotebook]);

  const sendQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");

    await start(
      `/api/v1/notebooks/${notebook.id}/ask`,
      { question: trimmed, language },
      {
        onDone: (data) => {
          if (data.refusal) {
            setMessages((m) => [
              ...m,
              {
                role: "assistant",
                text: String(data.refusal_message || data.answer || t("refusal_message")),
                refusal: true,
              },
            ]);
          } else {
            setMessages((m) => [
              ...m,
              { role: "assistant", text: String(data.answer ?? "") },
            ]);
          }
        },
        onError: (err) => {
          toast.show(err || t("chat_error", "Не удалось получить ответ"), "error");
        },
      },
    );
  }, [isStreaming, language, notebook.id, start, t, toast]);

  return (
    <div className="workspace-panel notebook-view">
      <div className="notebook-view-head">
        <button type="button" className="icon-button" onClick={onBack} aria-label={t("back")}>
          <Icon name="arrow-left" size={20} />
        </button>
        <div>
          <h2 className="skill-editor-title">{notebook.title}</h2>
          <p className="panel-subtitle">
            {t("notebook_subtitle", "{{count}} источников в рабочем окне", { count: notebook.files.length })}
          </p>
        </div>
      </div>

      <div className="notebook-view-grid">
        <section className="notebook-sources">
          <h3>{t("tab_sources", "Источники")}</h3>
          <ul className="notebook-source-list">
            {notebook.files.map((f) => (
              <li key={f.file_id} className="notebook-source-item">
                <Icon name="file-text" size={16} />
                <span>{f.original_name}</span>
              </li>
            ))}
            {notebook.files.length === 0 && (
              <li className="notebook-source-empty">{t("advisor_no_sources", "Материалы не найдены")}</li>
            )}
          </ul>
          <DropZone onFilesSelected={handleUpload} uploading={uploading} />
        </section>

        <section className="notebook-chat">
          <h3>{t("notebook_title", "Чат")}</h3>
          <div className="modal-chat-log notebook-chat-log">
            {messages.length === 0 && (
              <p className="notebook-empty-chat">{t("notebook_empty_chat")}</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble chat-bubble-${msg.role}${msg.refusal ? " chat-refusal" : ""}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form
            className="chat-compose"
            onSubmit={(e) => { e.preventDefault(); void sendQuestion(input); }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("ask_placeholder", "Задайте вопрос...")}
              disabled={isStreaming || notebook.files.length === 0}
              className="field-input"
            />
            <button type="submit" disabled={isStreaming || !input.trim()} className="chat-send">
              <Icon name="send" size={22} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
