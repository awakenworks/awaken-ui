import { ArrowDown } from "../icons/index.js";
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
  readonly viewportClassName?: string;
  readonly jumpClassName?: string;
  readonly jumpIcon?: ReactNode;
};

/** Follows streaming output only while the reader remains near the bottom. */
export function ChatMessageList({
  children,
  ariaLabel,
  jumpLabel,
  busy = false,
  className,
  viewportClassName,
  jumpClassName,
  jumpIcon,
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
    if (!viewport) return;
    const synchronize = () => {
      if (viewport.clientHeight === 0) return;
      if (followingRef.current) scrollToBottom("auto");
      const following = isNearChatBottom(viewport.scrollTop, viewport.scrollHeight, viewport.clientHeight);
      followingRef.current = following;
      setShowJump(!following);
    };
    const mutations = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(synchronize);
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(synchronize);
    mutations?.observe(viewport, { childList: true, subtree: true, characterData: true });
    resize?.observe(viewport);
    synchronize();
    return () => { mutations?.disconnect(); resize?.disconnect(); };
  }, [scrollToBottom]);

  return (
    <div className={cx("ui-chat-list", className)}>
      <div
        ref={viewportRef}
        className={cx("ui-chat-list__viewport", viewportClassName)}
        role="log"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-busy={busy}
        aria-live="polite"
        onScroll={(event) => {
          const node = event.currentTarget;
          if (node.clientHeight === 0) return;
          const following = isNearChatBottom(node.scrollTop, node.scrollHeight, node.clientHeight);
          followingRef.current = following;
          setShowJump(!following);
        }}
      >
        {children}
      </div>
      {showJump ? (
        <button
          className={cx("ui-chat-list__jump", jumpClassName)}
          type="button"
          onClick={() => {
            followingRef.current = true;
            setShowJump(false);
            scrollToBottom(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
          }}
        >
          <span aria-hidden="true">{jumpIcon ?? <ArrowDown />}</span> {jumpLabel}
        </button>
      ) : null}
    </div>
  );
}
