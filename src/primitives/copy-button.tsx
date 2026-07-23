import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Button } from "./button.js";

export type CopyButtonProps = {
  readonly value: string;
  readonly label: string;
  readonly copiedLabel: string;
  readonly icon?: ReactNode;
  readonly copiedIcon?: ReactNode;
  readonly resetAfter?: number;
  readonly className?: string;
};

export function CopyButton({
  value,
  label,
  copiedLabel,
  icon,
  copiedIcon,
  resetAfter = 1500,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = async () => {
    try {
      if (!globalThis.navigator?.clipboard) return;
      await globalThis.navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfter);
    } catch {
      // Clipboard may be blocked; an idle button remains the safe fallback.
    }
  };
  const currentLabel = copied ? copiedLabel : label;
  return (
    <Button
      type="button"
      variant="icon"
      className={cx("ui-copy", copied && "is-copied", className)}
      aria-label={currentLabel}
      title={currentLabel}
      onClick={() => void copy()}
    >
      {copied ? copiedIcon ?? <span aria-hidden="true">✓</span> : icon ?? <span aria-hidden="true">□</span>}
    </Button>
  );
}
