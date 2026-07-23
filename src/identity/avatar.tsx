import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  readonly label: string;
  readonly size?: AvatarSize;
  readonly src?: string;
  readonly initials?: string;
  readonly children?: ReactNode;
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
  className,
  ...props
}: AvatarProps) {
  const customContent = children !== undefined;
  return (
    <span
      {...props}
      aria-label={label}
      className={cx("ui-avatar", className)}
      data-size={size}
    >
      {src ? <img className="ui-avatar__image" src={src} alt="" /> : null}
      {!src && customContent ? children : null}
      {!src && !customContent ? (
        <span aria-hidden="true">{initials?.trim() || initialsOf(label)}</span>
      ) : null}
    </span>
  );
}
