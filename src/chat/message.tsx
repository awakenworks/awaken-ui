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
  readonly classes?: {
    readonly media?: string;
    readonly content?: string;
    readonly header?: string;
    readonly author?: string;
    readonly time?: string;
    readonly body?: string;
  };
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
  classes,
}: ChatMessageProps) {
  const stamp = formatChatTime(timestamp);
  return (
    <article className={cx("ui-chat-message", className)} data-role={role} data-compact={compact || undefined}>
      <div className={cx("ui-chat-message__media", classes?.media)}>
        {media ?? <Avatar label={authorLabel} size="sm" />}
      </div>
      <div className={cx("ui-chat-message__content", classes?.content)}>
        <header className={cx("ui-chat-message__header", classes?.header)}>
          <strong className={classes?.author}>{authorLabel}</strong>
          {stamp ? <time className={classes?.time} dateTime={timestamp}>{stamp}</time> : null}
          {actions}
        </header>
        {body === undefined ? null : <div className={cx("ui-chat-message__body", classes?.body)}>{body}</div>}
        {children}
      </div>
    </article>
  );
}
