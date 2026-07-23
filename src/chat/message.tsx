import type { ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Avatar } from "../identity/avatar.js";
import type { ChatRole } from "./model.js";

export function formatChatTime(timestamp: string | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export type ChatMessageProps = {
  readonly role: ChatRole;
  readonly authorLabel: string;
  readonly body?: ReactNode;
  readonly media?: ReactNode;
  readonly timestamp?: string;
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly compact?: boolean;
  readonly className?: string;
};

export function ChatMessage({
  role,
  authorLabel,
  body,
  media,
  timestamp,
  actions,
  children,
  compact = false,
  className,
}: ChatMessageProps) {
  const stamp = formatChatTime(timestamp);
  return (
    <article className={cx("ui-chat-message", className)} data-role={role} data-compact={compact || undefined}>
      <div className="ui-chat-message__media">
        {media ?? <Avatar label={authorLabel} size="sm" />}
      </div>
      <div className="ui-chat-message__content">
        <header className="ui-chat-message__header">
          <strong>{authorLabel}</strong>
          {stamp ? <time dateTime={timestamp}>{stamp}</time> : null}
          {actions}
        </header>
        {body === undefined ? null : <div className="ui-chat-message__body">{body}</div>}
        {children}
      </div>
    </article>
  );
}
