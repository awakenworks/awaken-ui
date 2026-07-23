import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export function DataTable({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-table", className)} role="table" />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-table__head", className)} role="rowgroup" />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-table__body", className)} role="rowgroup" />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-table__row", className)} role="row" />;
}

export function TableHeaderCell({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx("ui-table__th", className)} role="columnheader" />;
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx("ui-table__td", className)} role="cell" />;
}
