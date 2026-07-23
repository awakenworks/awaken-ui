import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export type PanelProps = HTMLAttributes<HTMLElement> & { readonly accent?: "agent" | "plain" };
export function Panel({ accent = "plain", className, ...props }: PanelProps) {
  return <aside {...props} className={cx("ui-panel", accent === "agent" && "ui-panel--agent", className)} />;
}
export function PanelHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-panel__header", className)} />;
}
export function PanelBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-panel__body", className)} />;
}
