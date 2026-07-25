import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type InlineNoticeTone = "neutral" | "info" | "success" | "warning" | "danger";
export type InlineNoticeProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  readonly tone?: InlineNoticeTone;
  readonly title?: ReactNode;
  readonly icon?: ReactNode;
  readonly actions?: ReactNode;
  readonly details?: ReactNode;
};

export function InlineNotice({
  tone = "neutral",
  title,
  icon,
  actions,
  details,
  children,
  className,
  ...props
}: InlineNoticeProps) {
  return <div {...props} className={cx("ui-inline-notice", className)} data-tone={tone}>
    {icon !== undefined && icon !== null ? <span className="ui-inline-notice__icon" aria-hidden="true">{icon}</span> : null}
    <div className="ui-inline-notice__content">
      {title !== undefined && title !== null ? <div className="ui-inline-notice__title">{title}</div> : null}
      {children !== undefined && children !== null ? <div className="ui-inline-notice__body">{children}</div> : null}
      {details !== undefined && details !== null ? <div className="ui-inline-notice__details">{details}</div> : null}
    </div>
    {actions !== undefined && actions !== null ? <div className="ui-inline-notice__actions">{actions}</div> : null}
  </div>;
}
