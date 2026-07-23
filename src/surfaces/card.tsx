import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={cx("ui-card", className)} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-card__header", className)} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-card__body", className)} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-card__footer", className)} />;
}
