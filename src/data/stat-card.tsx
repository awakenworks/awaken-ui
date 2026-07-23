import {
  cloneElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../internal/cx.js";

export type StatTone =
  | "accent"
  | "agent"
  | "danger"
  | "success"
  | "warning"
  | "neutral";

export interface StatCardProps {
  readonly value: ReactNode;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  readonly hint?: ReactNode;
  readonly tone?: StatTone;
  readonly variant?: "tile" | "metric";
  readonly onClick?: () => void;
  readonly className?: string;
  readonly ariaLabel?: string;
  /** Product navigation adapters may supply a router Link here. */
  readonly render?: ReactElement<HTMLAttributes<HTMLElement>>;
}

export function StatCard({
  value,
  label,
  icon,
  hint,
  tone = "neutral",
  variant = "tile",
  onClick,
  className,
  ariaLabel,
  render,
}: StatCardProps) {
  const classes = cx(
    "ui-stat",
    `ui-stat--${variant}`,
    tone !== "neutral" && `ui-stat--${tone}`,
    className,
  );
  const content = (
    <>
      {icon ? <span className="ui-stat__icon">{icon}</span> : null}
      <span className="ui-stat__body">
        <span className="ui-stat__value">{value}</span>
        <span className="ui-stat__label">{label}</span>
        {hint ? <span className="ui-stat__hint">{hint}</span> : null}
      </span>
    </>
  );
  if (render) {
    return cloneElement(
      render,
      {
        "aria-label": ariaLabel,
        className: cx(classes, render.props.className),
        onClick,
      },
      content,
    );
  }
  if (onClick) {
    return (
      <button type="button" className={classes} aria-label={ariaLabel} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className={classes} aria-label={ariaLabel}>{content}</div>;
}

export function StatGrid({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-stat-grid", className)} />;
}
