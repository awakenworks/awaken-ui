import { useEffect, useState, type ReactNode } from "react";

export type ChatThinkingProps = {
  readonly label: string;
  readonly formatElapsed?: (seconds: number) => string;
  readonly icon?: ReactNode;
};

export function ChatThinking({ label, formatElapsed, icon }: ChatThinkingProps) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = globalThis.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => globalThis.clearInterval(timer);
  }, []);
  return (
    <div className="ui-chat-thinking" role="status" aria-live="polite">
      <span className="ui-chat-thinking__icon" aria-hidden="true">{icon ?? "◌"}</span>
      <span>{label}{elapsed > 0 && formatElapsed ? ` · ${formatElapsed(elapsed)}` : ""}</span>
      <span className="ui-chat-thinking__dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  );
}

export type ReasoningBlockProps = {
  readonly label: string;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly streaming?: boolean;
};

export function ReasoningBlock({
  label,
  children,
  defaultOpen = false,
  streaming = false,
}: ReasoningBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="ui-chat-reasoning">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">◇</span><span>{label}</span><span aria-hidden="true">{open ? "⌄" : "›"}</span>
      </button>
      {open ? <div>{children}{streaming ? <span aria-hidden="true">▍</span> : null}</div> : null}
    </section>
  );
}
