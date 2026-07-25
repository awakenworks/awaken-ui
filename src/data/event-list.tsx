import type { HTMLAttributes, ReactNode, TimeHTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export type EventListProps = HTMLAttributes<HTMLOListElement> & { readonly density?: "compact" | "default" };

export function EventList({ density = "default", className, ...props }: EventListProps) {
  return <ol {...props} className={cx("ui-event-list", className)} data-density={density} />;
}

export type EventItemProps = HTMLAttributes<HTMLLIElement> & {
  readonly marker?: ReactNode;
  readonly title: ReactNode;
  readonly timestamp?: ReactNode;
  readonly metadata?: ReactNode;
  readonly actions?: ReactNode;
};

export function EventItem({ marker, title, timestamp, metadata, actions, children, className, ...props }: EventItemProps) {
  return <li {...props} className={cx("ui-event-list__item", className)}>
    <span className="ui-event-list__rail" aria-hidden="true"><span className="ui-event-list__marker">{marker}</span></span>
    <div className="ui-event-list__content">
      <div className="ui-event-list__header"><span className="ui-event-list__title">{title}</span>{timestamp}</div>
      {metadata !== undefined && metadata !== null ? <div className="ui-event-list__metadata">{metadata}</div> : null}
      {children !== undefined && children !== null ? <div className="ui-event-list__body">{children}</div> : null}
    </div>
    {actions !== undefined && actions !== null ? <div className="ui-event-list__actions">{actions}</div> : null}
  </li>;
}

export function EventTime({ className, ...props }: TimeHTMLAttributes<HTMLTimeElement>) {
  return <time {...props} className={cx("ui-event-list__time", className)} />;
}
