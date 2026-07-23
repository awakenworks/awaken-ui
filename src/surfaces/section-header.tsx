import type { ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type SectionHeaderProps = {
  readonly title: ReactNode;
  readonly icon?: ReactNode;
  readonly count?: ReactNode;
  readonly actions?: ReactNode;
  readonly as?: "h2" | "h3" | "h4";
  readonly className?: string;
};

export function SectionHeader({ title, icon, count, actions, as: Heading = "h2", className }: SectionHeaderProps) {
  return (
    <div className={cx("ui-section-head", className)}>
      <Heading className="ui-section-head__title">
        {icon ? <span className="ui-section-head__icon">{icon}</span> : null}
        <span>{title}</span>
        {count == null ? null : <span className="ui-section-head__count">{count}</span>}
      </Heading>
      {actions ? <div className="ui-section-head__actions">{actions}</div> : null}
    </div>
  );
}
