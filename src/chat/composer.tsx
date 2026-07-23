import {
  useCallback,
  useLayoutEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cx } from "../internal/cx.js";

export type ChatComposerSendMode = "modifier-enter" | "enter";

export function resizeComposerToContent(textarea: HTMLTextAreaElement | null): void {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function useAutoGrowingComposer(value: string): {
  readonly ref: RefObject<HTMLTextAreaElement | null>;
  readonly resize: () => void;
} {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => resizeComposerToContent(ref.current), []);
  useLayoutEffect(() => resize(), [resize, value]);
  return { ref, resize };
}

export function isComposerSubmitShortcut(
  event: KeyboardEvent<HTMLTextAreaElement>,
  mode: ChatComposerSendMode,
): boolean {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return false;
  return mode === "modifier-enter"
    ? event.ctrlKey || event.metaKey
    : !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
}

export type ChatComposerProps = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onStop?: () => void;
  readonly busy?: boolean;
  readonly disabled?: boolean;
  readonly sendMode?: ChatComposerSendMode;
  readonly placeholder: string;
  readonly ariaLabel: string;
  readonly sendLabel: string;
  readonly stopLabel?: string;
  readonly hint?: ReactNode;
  readonly leadingActions?: ReactNode;
  readonly sendIcon?: ReactNode;
  readonly stopIcon?: ReactNode;
  readonly className?: string;
  readonly classes?: {
    readonly inputWrapper?: string;
    readonly input?: string;
    readonly controls?: string;
    readonly leading?: string;
    readonly actions?: string;
    readonly send?: string;
    readonly stop?: string;
    readonly hint?: string;
  };
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy = false,
  disabled = false,
  sendMode = "modifier-enter",
  placeholder,
  ariaLabel,
  sendLabel,
  stopLabel,
  hint,
  leadingActions,
  sendIcon,
  stopIcon,
  className,
  classes,
}: ChatComposerProps) {
  const { ref } = useAutoGrowingComposer(value);
  const canSubmit = !disabled && !busy && value.trim().length > 0;
  const submit = () => {
    if (canSubmit) onSubmit();
  };
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isComposerSubmitShortcut(event, sendMode)) return;
    event.preventDefault();
    submit();
  };

  return (
    <form className={cx("ui-chat-composer", className)} onSubmit={onFormSubmit}>
      <div className={cx("ui-chat-composer__input-wrap", classes?.inputWrapper)}>
        <textarea
          ref={ref}
          className={cx("ui-chat-composer__input", classes?.input)}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className={cx("ui-chat-composer__controls", classes?.controls)}>
        <div className={cx("ui-chat-composer__leading", classes?.leading)}>{leadingActions}</div>
        <div className={cx("ui-chat-composer__actions", classes?.actions)}>
          {onStop && stopLabel ? (
            <button className={classes?.stop} type="button" disabled={!busy} onClick={onStop} aria-label={stopLabel} title={stopLabel}>
              {stopIcon ?? <span aria-hidden="true">■</span>}
            </button>
          ) : null}
          <button className={classes?.send} type="submit" disabled={!canSubmit} aria-label={sendLabel} title={sendLabel}>
            {sendIcon ?? <span aria-hidden="true">↑</span>}
          </button>
        </div>
      </div>
      {hint === undefined ? null : <div className={cx("ui-chat-composer__hint", classes?.hint)}>{hint}</div>}
    </form>
  );
}
