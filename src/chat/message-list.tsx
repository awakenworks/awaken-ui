import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../internal/cx.js";

export const CHAT_STICK_THRESHOLD = 80;

export function isNearChatBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold = CHAT_STICK_THRESHOLD,
): boolean {
  return scrollHeight - (scrollTop + clientHeight) <= threshold;
}

export type ChatMessageListProps = {
  readonly children: ReactNode;
  readonly ariaLabel: string;
  readonly jumpLabel: string;
  readonly busy?: boolean;
  readonly className?: string;
};

/** Follows streaming output only while the reader remains near the bottom. */
export function ChatMessageList({
  children,
  ariaLabel,
  jumpLabel,
  busy = false,
  className,
}: ChatMessageListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo?.({ top: viewport.scrollHeight, behavior });
    if (typeof viewport.scrollTo !== "function") viewport.scrollTop = viewport.scrollHeight;
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      if (followingRef.current) scrollToBottom("auto");
    });
    observer.observe(viewport, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [scrollToBottom]);

  return (
    <div className={cx("ui-chat-list", className)}>
      <div
        ref={viewportRef}
        className="ui-chat-list__viewport"
        role="log"
        aria-label={ariaLabel}
        aria-busy={busy}
        aria-live="polite"
        onScroll={(event) => {
          const node = event.currentTarget;
          const following = isNearChatBottom(node.scrollTop, node.scrollHeight, node.clientHeight);
          followingRef.current = following;
          setShowJump(!following);
        }}
      >
        {children}
      </div>
      {showJump ? (
        <button
          className="ui-chat-list__jump"
          type="button"
          onClick={() => {
            followingRef.current = true;
            setShowJump(false);
            scrollToBottom("smooth");
          }}
        >
          <span aria-hidden="true">↓</span> {jumpLabel}
        </button>
      ) : null}
    </div>
  );
}
