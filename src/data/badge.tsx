import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type UiTone = "neutral" | "success" | "warning" | "danger" | "info" | "agent" | "status" | "priority";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: UiTone;
};

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={cx("ui-badge", `ui-badge--${tone}`, className)}>{children}</span>;
}

export function StatusPill({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return <span {...props} className={cx("ui-status-pill", `ui-status-pill--${tone}`, className)}>{children}</span>;
}

export type ChipProps = BadgeProps & { readonly icon?: ReactNode };

export function Chip({ children, className, icon, tone = "neutral", ...props }: ChipProps) {
  return <span {...props} className={cx("ui-chip", `ui-chip--${tone}`, className)}>{icon}{children}</span>;
}
