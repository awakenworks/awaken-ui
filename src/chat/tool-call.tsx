import { useState, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import type { ToolCallTone, ToolCallView } from "./model.js";

export type ToolCallLabels = {
  readonly input: string;
  readonly output: string;
  readonly inputAriaLabel: string;
  readonly outputAriaLabel: string;
};

export type ToolCallCardProps = Omit<ToolCallView, "id"> & {
  readonly labels: ToolCallLabels;
  readonly icon?: ReactNode;
  readonly expandIcon?: ReactNode;
  readonly badges?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly className?: string;
  readonly classes?: {
    readonly header?: string;
    readonly icon?: string;
    readonly name?: string;
    readonly status?: string;
    readonly chevron?: string;
    readonly body?: string;
    readonly label?: string;
    readonly pre?: string;
    readonly result?: string;
  } | undefined;
};

export function ToolCallCard({
  name,
  statusLabel,
  tone,
  input,
  output,
  labels,
  icon,
  expandIcon,
  badges,
  defaultOpen = false,
  className,
  classes,
}: ToolCallCardProps) {
  const hasDetail = Boolean(input || output);
  const [open, setOpen] = useState(defaultOpen && hasDetail);
  return (
    <div className={cx("ui-chat-tool", className)} data-tone={tone}>
      <button
        className={cx("ui-chat-tool__header", classes?.header)}
        type="button"
        disabled={!hasDetail}
        aria-expanded={hasDetail ? open : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cx("ui-chat-tool__icon", classes?.icon)} aria-hidden="true">{icon ?? toneMark(tone)}</span>
        <span className={cx("ui-chat-tool__name", classes?.name)}>{name}</span>
        {badges}
        <span className={cx("ui-chat-tool__status", classes?.status)}>{statusLabel}</span>
        {hasDetail ? <span className={cx(classes?.chevron, open && "is-open")} data-open={open || undefined} aria-hidden="true">{expandIcon ?? (open ? "⌄" : "›")}</span> : null}
      </button>
      {open ? (
        <div className={cx("ui-chat-tool__body", classes?.body)}>
          {input ? <ToolDetail label={labels.input} ariaLabel={labels.inputAriaLabel} value={input} labelClassName={classes?.label} preClassName={classes?.pre} /> : null}
          {output ? <ToolDetail label={labels.output} ariaLabel={labels.outputAriaLabel} value={output} labelClassName={classes?.label} preClassName={cx(classes?.pre, classes?.result)} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolDetail({ label, ariaLabel, value, labelClassName, preClassName }: { label: string; ariaLabel: string; value: string; labelClassName?: string | undefined; preClassName?: string | undefined }) {
  return <div><span className={cx("ui-chat-tool__label", labelClassName)}>{label}</span><pre className={preClassName} aria-label={ariaLabel}>{value}</pre></div>;
}

function toneMark(tone: ToolCallTone): string {
  if (tone === "done") return "✓";
  if (tone === "error") return "×";
  if (tone === "running") return "◌";
  return "◇";
}

export type ToolCallGroupProps = {
  readonly calls: ReadonlyArray<ToolCallView>;
  readonly summaryLabel: string;
  readonly labels: ToolCallLabels;
  readonly defaultOpen?: boolean;
  readonly icon?: ReactNode;
  readonly expandIcon?: ReactNode;
  readonly className?: string;
  readonly classes?: {
    readonly header?: string;
    readonly icon?: string;
    readonly summary?: string;
    readonly dot?: string;
    readonly chevron?: string;
    readonly body?: string;
  };
  readonly callClasses?: ToolCallCardProps["classes"] | undefined;
};

export function aggregateToolCallTone(calls: ReadonlyArray<ToolCallView>): ToolCallTone {
  if (calls.some((call) => call.tone === "error")) return "error";
  if (calls.some((call) => call.tone === "running" || call.tone === "pending")) return "running";
  return "done";
}

export function ToolCallGroup({ calls, summaryLabel, labels, defaultOpen, icon, expandIcon, className, classes, callClasses }: ToolCallGroupProps) {
  const tone = aggregateToolCallTone(calls);
  const [open, setOpen] = useState(defaultOpen ?? tone !== "done");
  const single = calls[0];
  if (calls.length === 1 && single) return <ToolCallCard {...single} labels={labels} classes={callClasses} />;
  if (calls.length === 0) return null;
  return (
    <div className={cx("ui-chat-tool-group", className)} data-tone={tone}>
      <button className={classes?.header} type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className={classes?.icon} aria-hidden="true">{icon ?? "◇"}</span>
        <span className={classes?.summary}>{summaryLabel}</span>
        <i className={classes?.dot} aria-hidden="true" />
        <span className={cx(classes?.chevron, open && "is-open")} data-open={open || undefined} aria-hidden="true">{expandIcon ?? (open ? "⌄" : "›")}</span>
      </button>
      {open ? <div className={classes?.body}>{calls.map((call) => <ToolCallCard key={call.id} {...call} labels={labels} classes={callClasses} />)}</div> : null}
    </div>
  );
}
