import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarClasses {
  readonly image?: string;
  readonly fallback?: string;
}

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  readonly label: string;
  readonly size?: AvatarSize;
  readonly src?: string;
  readonly initials?: string;
  readonly children?: ReactNode;
  readonly classes?: AvatarClasses;
};

export function initialsOf(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words.at(-1)?.[0] ?? "" : "";
  return `${first}${last}`.toLocaleUpperCase();
}

/** Product-neutral identity carrier. Custom generated marks use `children`. */
export function Avatar({
  label,
  size = "md",
  src,
  initials,
  children,
  classes,
  className,
  ...props
}: AvatarProps) {
  const customContent = children !== undefined;
  return (
    <span
      {...props}
      role="img"
      aria-label={label}
      className={cx("ui-avatar", className)}
      data-size={size}
    >
      {src ? <img className={cx("ui-avatar__image", classes?.image)} src={src} alt="" /> : null}
      {!src && customContent ? children : null}
      {!src && !customContent ? (
        <span className={classes?.fallback} aria-hidden="true">
          {initials?.trim() || initialsOf(label)}
        </span>
      ) : null}
    </span>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly overflow?: number;
  readonly overflowLabel?: (count: number) => string;
  readonly avatarClasses?: AvatarClasses;
}

export function AvatarGroup({
  children,
  className,
  overflow = 0,
  overflowLabel = (count) => `+${count}`,
  avatarClasses,
  ...props
}: AvatarGroupProps) {
  return (
    <span {...props} className={cx("ui-avatar-group", className)}>
      {children}
      {overflow > 0 ? (
        <Avatar
          className="ui-avatar--overflow"
          initials={`+${overflow}`}
          label={overflowLabel(overflow)}
          {...(avatarClasses ? { classes: avatarClasses } : {})}
        />
      ) : null}
    </span>
  );
}
