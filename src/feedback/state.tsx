import type { ReactNode } from "react";
import { Button } from "../primitives/button.js";

export type StateAction = {
  readonly label: string;
  readonly onClick?: () => void;
  readonly href?: string;
};
export type StateProps = {
  readonly action?: StateAction;
  readonly actions?: ReactNode;
  readonly body?: ReactNode;
  readonly className?: string;
  readonly icon?: ReactNode;
  readonly title: ReactNode;
};

export function EmptyState(props: StateProps) {
  return <StateBlock {...props} tone="neutral" />;
}
export function ErrorState(props: StateProps) {
  return <StateBlock {...props} tone="danger" />;
}
export function LoadingState({ label, icon }: { readonly label: ReactNode; readonly icon?: ReactNode }) {
  return <div className="ui-state ui-state--loading" role="status">
    {icon ? <span className="ui-state__icon">{icon}</span> : null}<p>{label}</p>
  </div>;
}
export function LoadingRow({ label, icon }: { readonly label: ReactNode; readonly icon?: ReactNode }) {
  return <div className="ui-state ui-state--neutral" role="status">
    {icon ? <span className="ui-state__icon">{icon}</span> : null}<p>{label}</p>
  </div>;
}
export function SkeletonList({ rows = 6, label }: { readonly rows?: number; readonly label: string }) {
  return <div className="ui-skeleton" role="status" aria-label={label}>
    {Array.from({ length: rows }, (_, index) => <div className="ui-skeleton-row" key={index}>
      <span className="ui-skeleton-bar ui-skeleton-bar--dot" />
      <span className="ui-skeleton-lines">
        <span className="ui-skeleton-bar ui-skeleton-bar--wide" />
        <span className="ui-skeleton-bar ui-skeleton-bar--narrow" />
      </span>
    </div>)}
  </div>;
}

export function Skeleton({
  width = "100%",
  height = 12,
  className,
}: {
  readonly width?: number | string;
  readonly height?: number;
  readonly className?: string;
}) {
  return <span aria-hidden="true" className={className ? `ui-skeleton-bar ${className}` : "ui-skeleton-bar"} style={{ width, height, display: "inline-block" }} />;
}

export type GateQuery = { readonly isLoading: boolean; readonly isError: boolean; readonly refetch?: () => unknown };
export type SurfaceGateProps = {
  readonly query: GateQuery;
  readonly isEmpty?: boolean;
  readonly loading: string;
  readonly loadingContent?: ReactNode;
  readonly error: { readonly title: string; readonly body: string; readonly retry: string };
  readonly empty?: StateProps;
  readonly loadingIcon?: ReactNode;
  readonly errorIcon?: ReactNode;
  readonly emptyIcon?: ReactNode;
  readonly children: ReactNode;
};

export function SurfaceGate({
  query,
  isEmpty = false,
  loading,
  loadingContent,
  error,
  empty,
  loadingIcon,
  errorIcon,
  emptyIcon,
  children,
}: SurfaceGateProps): ReactNode {
  if (query.isLoading) return <>{loadingContent ?? <LoadingState label={loading} icon={loadingIcon} />}</>;
  if (query.isError) return <ErrorState
    title={error.title}
    body={error.body}
    icon={errorIcon}
    action={{ label: error.retry, onClick: () => void query.refetch?.() }}
  />;
  if (isEmpty && empty) return <EmptyState {...empty} icon={empty.icon ?? emptyIcon} />;
  return <>{children}</>;
}

function StateBlock({ action, actions, body, className, icon, title, tone }: StateProps & { readonly tone: "danger" | "neutral" }) {
  return <div className={`ui-state ui-state--${tone}${className ? ` ${className}` : ""}`}>
    {icon ? <span className="ui-state__icon">{icon}</span> : null}
    <h2>{title}</h2>{body === undefined ? null : <p>{body}</p>}
    {action?.href ? <a className="ui-button" data-variant="secondary" href={action.href}>{action.label}</a>
      : action ? <Button onClick={action.onClick} variant={tone === "danger" ? "danger" : "secondary"}>{action.label}</Button>
      : null}
    {actions}
  </div>;
}
