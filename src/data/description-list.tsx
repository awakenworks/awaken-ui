import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export type DescriptionListProps = HTMLAttributes<HTMLDListElement> & {
  readonly columns?: 1 | 2 | 3;
  readonly density?: "compact" | "default";
};

export function DescriptionList({ columns = 1, density = "default", className, ...props }: DescriptionListProps) {
  return <dl {...props} className={cx("ui-description-list", className)} data-columns={columns} data-density={density} />;
}

export function DescriptionItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("ui-description-list__item", className)} />;
}

export function DescriptionTerm({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <dt {...props} className={cx("ui-description-list__term", className)} />;
}

export function DescriptionDetails({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <dd {...props} className={cx("ui-description-list__details", className)} />;
}
