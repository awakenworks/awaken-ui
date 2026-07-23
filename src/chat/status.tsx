import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type ChatThinkingProps = {
  readonly label: string;
  readonly formatElapsed?: (seconds: number) => string;
  readonly icon?: ReactNode;
  readonly className?: string;
  readonly classes?: { readonly icon?: string; readonly label?: string; readonly dots?: string };
};

export function ChatThinking({ label, formatElapsed, icon, className, classes }: ChatThinkingProps) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = globalThis.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => globalThis.clearInterval(timer);
  }, []);
  return (
    <div className={cx("ui-chat-thinking", className)} role="status" aria-live="polite">
      <span className={cx("ui-chat-thinking__icon", classes?.icon)} aria-hidden="true">{icon ?? "◌"}</span>
      <span className={classes?.label}>{label}{elapsed > 0 && formatElapsed ? ` · ${formatElapsed(elapsed)}` : ""}</span>
      <span className={cx("ui-chat-thinking__dots", classes?.dots)} aria-hidden="true"><i /><i /><i /></span>
    </div>
  );
}

export type ReasoningBlockProps = {
  readonly label: string;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly streaming?: boolean;
  readonly icon?: ReactNode;
  readonly expandIcon?: ReactNode;
  readonly className?: string;
  readonly classes?: { readonly header?: string; readonly icon?: string; readonly chevron?: string; readonly body?: string; readonly caret?: string };
};

export function ReasoningBlock({
  label,
  children,
  defaultOpen = false,
  streaming = false,
  icon,
  expandIcon,
  className,
  classes,
}: ReasoningBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cx("ui-chat-reasoning", className)}>
      <button className={classes?.header} type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className={classes?.icon} aria-hidden="true">{icon ?? "◇"}</span><span>{label}</span>
        <span className={cx(classes?.chevron, open && "is-open")} data-open={open || undefined} aria-hidden="true">{expandIcon ?? (open ? "⌄" : "›")}</span>
      </button>
      {open ? <div className={classes?.body}>{children}{streaming ? <span className={classes?.caret} aria-hidden="true">▍</span> : null}</div> : null}
    </section>
  );
}
