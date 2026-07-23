import type { CSSProperties } from "react";
import { cx } from "../internal/cx.js";

export type StatusDotProps = {
  readonly tone?: string;
  readonly color?: string;
  readonly className?: string;
  readonly title?: string;
  readonly label?: string;
};

export function StatusDot({ tone, color, className, title, label }: StatusDotProps) {
  const style: CSSProperties | undefined = color ? { background: color } : undefined;
  return (
    <span
      className={cx(tone && `health-dot health-dot--${tone}`, className) || undefined}
      style={style}
      title={title}
      aria-label={label}
      aria-hidden={label || title ? undefined : true}
    />
  );
}
