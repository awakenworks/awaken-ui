import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export function Toolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("surface-toolbar", className)} />;
}
export function ToolbarLead({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx("surface-toolbar-lead", className)} />;
}
export function ToolbarSpacer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} aria-hidden="true" className={cx("surface-toolbar__spacer", className)} />;
}
