import { useState, type ReactNode } from "react";
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
  readonly defaultOpen?: boolean;
};

export function ToolCallCard({
  name,
  statusLabel,
  tone,
  input,
  output,
  labels,
  icon,
  defaultOpen = false,
}: ToolCallCardProps) {
  const hasDetail = Boolean(input || output);
  const [open, setOpen] = useState(defaultOpen && hasDetail);
  return (
    <div className="ui-chat-tool" data-tone={tone}>
      <button
        className="ui-chat-tool__header"
        type="button"
        disabled={!hasDetail}
        aria-expanded={hasDetail ? open : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ui-chat-tool__icon" aria-hidden="true">{icon ?? toneMark(tone)}</span>
        <span className="ui-chat-tool__name">{name}</span>
        <span className="ui-chat-tool__status">{statusLabel}</span>
        {hasDetail ? <span aria-hidden="true">{open ? "⌄" : "›"}</span> : null}
      </button>
      {open ? (
        <div className="ui-chat-tool__body">
          {input ? <ToolDetail label={labels.input} ariaLabel={labels.inputAriaLabel} value={input} /> : null}
          {output ? <ToolDetail label={labels.output} ariaLabel={labels.outputAriaLabel} value={output} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolDetail({ label, ariaLabel, value }: { label: string; ariaLabel: string; value: string }) {
  return <div><span className="ui-chat-tool__label">{label}</span><pre aria-label={ariaLabel}>{value}</pre></div>;
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
};

export function aggregateToolCallTone(calls: ReadonlyArray<ToolCallView>): ToolCallTone {
  if (calls.some((call) => call.tone === "error")) return "error";
  if (calls.some((call) => call.tone === "running" || call.tone === "pending")) return "running";
  return "done";
}

export function ToolCallGroup({ calls, summaryLabel, labels, defaultOpen }: ToolCallGroupProps) {
  const tone = aggregateToolCallTone(calls);
  const [open, setOpen] = useState(defaultOpen ?? tone !== "done");
  const single = calls[0];
  if (calls.length === 1 && single) return <ToolCallCard {...single} labels={labels} />;
  if (calls.length === 0) return null;
  return (
    <div className="ui-chat-tool-group" data-tone={tone}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">◇</span><span>{summaryLabel}</span><i aria-hidden="true" />
        <span aria-hidden="true">{open ? "⌄" : "›"}</span>
      </button>
      {open ? <div>{calls.map((call) => <ToolCallCard key={call.id} {...call} labels={labels} />)}</div> : null}
    </div>
  );
}
