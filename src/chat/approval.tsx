import type { ReactNode } from "react";
import { Button } from "../primitives/button.js";

export type ChatApprovalProps = {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly note?: string;
  readonly onNoteChange?: (note: string) => void;
  readonly noteLabel?: string;
  readonly notePlaceholder?: string;
  readonly approveLabel: string;
  readonly rejectLabel: string;
  readonly onApprove: () => void;
  readonly onReject: () => void;
  readonly pending?: boolean;
};

/** Product-neutral human-in-the-loop decision embedded in a transcript. */
export function ChatApproval({
  title,
  description,
  note,
  onNoteChange,
  noteLabel,
  notePlaceholder,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  pending = false,
}: ChatApprovalProps) {
  return (
    <section className="ui-chat-approval">
      <strong>{title}</strong>
      {description === undefined ? null : <div>{description}</div>}
      {note !== undefined && onNoteChange && noteLabel ? (
        <label>
          <span>{noteLabel}</span>
          <textarea
            value={note}
            placeholder={notePlaceholder}
            disabled={pending}
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </label>
      ) : null}
      <div className="ui-chat-approval__actions">
        <Button variant="ghost" disabled={pending} onClick={onReject}>{rejectLabel}</Button>
        <Button variant="primary" loading={pending} onClick={onApprove}>{approveLabel}</Button>
      </div>
    </section>
  );
}
