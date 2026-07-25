import { cloneElement, type AnchorHTMLAttributes, type HTMLAttributes, type ReactElement } from "react";
import { cx } from "../internal/cx.js";

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & { readonly label: string };

export function Breadcrumbs({ label, className, children, ...props }: BreadcrumbsProps) {
  return <nav {...props} className={cx("ui-breadcrumbs", className)} aria-label={label}>
    <ol className="ui-breadcrumbs__list">{children}</ol>
  </nav>;
}

type BreadcrumbItemBaseProps = {
  readonly separator?: ReactElement | string;
};

export type BreadcrumbItemProps = BreadcrumbItemBaseProps & (
  | (HTMLAttributes<HTMLSpanElement> & { readonly current: true; readonly href?: never; readonly render?: never })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & {
      readonly current?: false;
      readonly render?: ReactElement<AnchorHTMLAttributes<HTMLAnchorElement>>;
    })
);

export function BreadcrumbItem(itemProps: BreadcrumbItemProps) {
  const { current = false, separator = "/", className, children } = itemProps;
  let content: ReactElement;
  if (current) {
    const { current: _current, separator: _separator, ...props } = itemProps;
    content = <span {...props} className={cx("ui-breadcrumbs__current", className)} aria-current="page">{children}</span>;
  } else {
    const { current: _current, separator: _separator, render, ...props } = itemProps;
    content = render
      ? cloneElement(render, { ...props, className: cx("ui-breadcrumbs__link", className, render.props.className) }, children)
      : <a {...props} className={cx("ui-breadcrumbs__link", className)}>{children}</a>;
  }
  return <li className="ui-breadcrumbs__item">
    {content}<span className="ui-breadcrumbs__separator" aria-hidden="true">{separator}</span>
  </li>;
}
