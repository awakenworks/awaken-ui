import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export function ToolbarRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-toolbar", className)} role={props.role ?? "toolbar"} />;
}
export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-stack", className)} />;
}
export function Cluster({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-cluster", className)} />;
}
export function SplitPane({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-split-pane", className)} />;
}
