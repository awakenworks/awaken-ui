import { useId, useRef, type ReactNode } from "react";
import { HeadlessAlertDialog } from "../internal/headless/dialog.js";
import { Button } from "../primitives/button.js";

export interface AlertDialogImpact {
  readonly id: string;
  readonly content: ReactNode;
  readonly tone?: "neutral" | "safe" | "danger";
}

export interface AlertDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly impacts?: readonly AlertDialogImpact[];
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly danger?: boolean;
}

/** Consequence-explicit confirmation dialog with safe initial focus. */
export function AlertDialog({
  cancelLabel,
  confirmLabel,
  danger = false,
  description,
  impacts,
  onConfirm,
  onOpenChange,
  open,
  title,
}: AlertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <HeadlessAlertDialog.Root
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
    >
      <HeadlessAlertDialog.Portal>
        <HeadlessAlertDialog.Backdrop className="ui-overlay__backdrop" />
        <HeadlessAlertDialog.Viewport className="ui-overlay__viewport">
          <HeadlessAlertDialog.Popup
            aria-describedby={description ? descriptionId : undefined}
            aria-labelledby={titleId}
            className="ui-alert-dialog"
            initialFocus={cancelRef}
          >
            <HeadlessAlertDialog.Title className="ui-dialog__title" id={titleId}>
              {title}
            </HeadlessAlertDialog.Title>
            {description ? (
              <HeadlessAlertDialog.Description
                className="ui-dialog__description"
                id={descriptionId}
              >
                {description}
              </HeadlessAlertDialog.Description>
            ) : null}
            {impacts && impacts.length > 0 ? (
              <ul className="ui-alert-dialog__impacts">
                {impacts.map((impact) => (
                  <li data-tone={impact.tone ?? "neutral"} key={impact.id}>
                    {impact.content}
                  </li>
                ))}
              </ul>
            ) : null}
            <footer className="ui-dialog__footer">
              <HeadlessAlertDialog.Close
                ref={cancelRef}
                render={<Button variant="ghost" />}
              >
                {cancelLabel}
              </HeadlessAlertDialog.Close>
              <Button
                onClick={onConfirm}
                variant={danger ? "danger" : "primary"}
              >
                {confirmLabel}
              </Button>
            </footer>
          </HeadlessAlertDialog.Popup>
        </HeadlessAlertDialog.Viewport>
      </HeadlessAlertDialog.Portal>
    </HeadlessAlertDialog.Root>
  );
}
