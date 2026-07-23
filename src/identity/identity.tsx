import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Avatar, type AvatarProps } from "./avatar.js";

export type IdentityProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  readonly name: ReactNode;
  readonly description?: ReactNode;
  readonly media?: ReactNode;
  readonly avatar?: AvatarProps;
  readonly status?: ReactNode;
  readonly badges?: ReactNode;
  readonly metadata?: ReactNode;
  readonly actions?: ReactNode;
};

/** Canonical media → name → supporting information identity skeleton. */
export function Identity({
  name,
  description,
  media,
  avatar,
  status,
  badges,
  metadata,
  actions,
  className,
  ...props
}: IdentityProps) {
  if (media === undefined && avatar === undefined) {
    throw new Error("Identity requires either media or avatar.");
  }

  return (
    <div {...props} className={cx("ui-identity", className)}>
      <div className="ui-identity__media">{media ?? (avatar ? <Avatar {...avatar} /> : null)}</div>
      <div className="ui-identity__body">
        <div className="ui-identity__heading">
          <div className="ui-identity__name">{name}</div>
          {status === undefined ? null : <div className="ui-identity__status">{status}</div>}
        </div>
        {description === undefined ? null : (
          <div className="ui-identity__description">{description}</div>
        )}
        {badges === undefined ? null : <div className="ui-identity__badges">{badges}</div>}
        {metadata === undefined ? null : <div className="ui-identity__metadata">{metadata}</div>}
      </div>
      {actions === undefined ? null : <div className="ui-identity__actions">{actions}</div>}
    </div>
  );
}

export type IdentityCardProps = IdentityProps & {
  readonly selected?: boolean;
  readonly href?: string;
  readonly onActivate?: () => void;
};

/** Surface wrapper; routing and domain actions remain consumer-owned. */
export function IdentityCard({
  selected = false,
  href,
  onActivate,
  className,
  ...identity
}: IdentityCardProps) {
  const content = <Identity {...identity} />;
  const interactive = href !== undefined || onActivate !== undefined;

  return (
    <article
      className={cx("ui-identity-card", className)}
      data-interactive={interactive || undefined}
      data-selected={selected || undefined}
    >
      {href !== undefined ? (
        <a className="ui-identity-card__target" href={href} onClick={onActivate}>
          {content}
        </a>
      ) : onActivate !== undefined ? (
        <button className="ui-identity-card__target" type="button" onClick={onActivate}>
          {content}
        </button>
      ) : content}
    </article>
  );
}
