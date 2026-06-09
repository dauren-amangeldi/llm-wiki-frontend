import { memo } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "../../stores/modal";
import { RefusalBox } from "./RefusalBox";

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUp?: (question: string) => void;
}

export const ChatMessage = memo(function ChatMessage({ message, onFollowUp }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
      {isUser ? (
        <p>{message.text}</p>
      ) : (
        <ReactMarkdown>{message.text}</ReactMarkdown>
      )}
      {message.citations && message.citations.length > 0 && (
        <div className="chat-bubble-citations">
          {message.citations.map((c, i) => (
            <span key={c.anchor || i} className="chat-citation">[{c.anchor}]</span>
          ))}
        </div>
      )}
      {message.insufficient_evidence && (
        <RefusalBox />
      )}
      {message.follow_ups && message.follow_ups.length > 0 && onFollowUp && (
        <div className="chat-follow-ups">
          {message.follow_ups.map((q, i) => (
            <button
              key={i}
              type="button"
              className="chat-follow-up-chip"
              onClick={() => onFollowUp(q)}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
