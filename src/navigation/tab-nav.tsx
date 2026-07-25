import { cloneElement, type AnchorHTMLAttributes, type HTMLAttributes, type ReactElement } from "react";
import { cx } from "../internal/cx.js";

export type TabNavProps = HTMLAttributes<HTMLElement> & { readonly label: string };

export function TabNav({ label, className, children, ...props }: TabNavProps) {
  return <nav {...props} className={cx("ui-tab-nav", className)} aria-label={label}>
    <ul className="ui-tab-nav__list">{children}</ul>
  </nav>;
}

export type TabNavItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  readonly current?: boolean;
  readonly render?: ReactElement<AnchorHTMLAttributes<HTMLAnchorElement>>;
};

export function TabNavItem({ current = false, render, className, children, ...props }: TabNavItemProps) {
  const anchorProps = {
    ...props,
    className: cx("ui-tab-nav__link", className, render?.props.className),
    "aria-current": current ? "page" as const : undefined,
    children,
  };
  return <li className="ui-tab-nav__item" data-current={current || undefined}>
    {render ? cloneElement(render, anchorProps) : <a {...anchorProps} />}
  </li>;
}
