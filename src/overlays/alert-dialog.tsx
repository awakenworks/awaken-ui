import { useId, useRef, type ReactNode } from "react";
import { HeadlessAlertDialog, modalOpenChange } from "../internal/headless/dialog.js";
import { cx } from "../internal/cx.js";
import { Button } from "../primitives/button.js";

export interface AlertDialogImpact {
  readonly id: string;
  readonly content: ReactNode;
  readonly tone?: "neutral" | "safe" | "danger";
  readonly icon?: ReactNode;
}

export interface AlertDialogClasses {
  readonly backdrop?: string;
  readonly viewport?: string;
  readonly panel?: string;
  readonly header?: string;
  readonly icon?: string;
  readonly title?: string;
  readonly body?: string;
  readonly description?: string;
  readonly impacts?: string;
  readonly impact?: string;
  readonly safeImpact?: string;
  readonly impactIcon?: string;
  readonly footer?: string;
  readonly closeButton?: string;
  readonly cancelButton?: string;
  readonly confirmButton?: string;
}

export interface AlertDialogProps {
  readonly open: boolean;
  /** Return false to decline dismissal without processing close focus. */
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly impacts?: readonly AlertDialogImpact[];
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly danger?: boolean;
  readonly icon?: ReactNode;
  readonly closeLabel?: string;
  readonly closeIcon?: ReactNode;
  readonly classes?: AlertDialogClasses;
  readonly role?: "alertdialog" | "dialog";
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
  icon,
  closeLabel,
  closeIcon,
  classes,
  role = "alertdialog",
}: AlertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <HeadlessAlertDialog.Root
      onOpenChange={modalOpenChange(onOpenChange)}
      open={open}
    >
      <HeadlessAlertDialog.Portal>
        <HeadlessAlertDialog.Backdrop className={classes?.backdrop ?? "ui-overlay__backdrop"} />
        <HeadlessAlertDialog.Viewport className={classes?.viewport ?? "ui-overlay__viewport"}>
          <HeadlessAlertDialog.Popup
            aria-describedby={description ? descriptionId : undefined}
            aria-labelledby={titleId}
            className={classes?.panel ?? "ui-alert-dialog"}
            initialFocus={cancelRef}
            role={role}
          >
            {icon || closeLabel ? (
              <header className={classes?.header}>
                {icon ? <span className={classes?.icon} aria-hidden="true">{icon}</span> : null}
                <HeadlessAlertDialog.Title className={classes?.title} id={titleId}>
                  {title}
                </HeadlessAlertDialog.Title>
                {closeLabel ? (
                  <HeadlessAlertDialog.Close
                    aria-label={closeLabel}
                    render={<Button className={classes?.closeButton} variant="icon" />}
                  >
                    {closeIcon}
                  </HeadlessAlertDialog.Close>
                ) : null}
              </header>
            ) : (
              <HeadlessAlertDialog.Title className={classes?.title ?? "ui-dialog__title"} id={titleId}>
                {title}
              </HeadlessAlertDialog.Title>
            )}
            <div className={classes?.body}>
              {description ? (
                <HeadlessAlertDialog.Description
                  className={classes?.description ?? "ui-dialog__description"}
                  id={descriptionId}
                >
                  {description}
                </HeadlessAlertDialog.Description>
              ) : null}
            {impacts && impacts.length > 0 ? (
              <ul className={classes?.impacts ?? "ui-alert-dialog__impacts"}>
                {impacts.map((impact) => (
                  <li
                    className={cx(
                      classes?.impact,
                      impact.tone === "safe" && classes?.safeImpact,
                    )}
                    data-tone={impact.tone ?? "neutral"}
                    key={impact.id}
                  >
                    {impact.icon ? (
                      <span className={classes?.impactIcon} aria-hidden="true">{impact.icon}</span>
                    ) : null}
                    {impact.content}
                  </li>
                ))}
              </ul>
            ) : null}
            </div>
            <footer className={classes?.footer ?? "ui-dialog__footer"}>
              <HeadlessAlertDialog.Close
                ref={cancelRef}
                render={<Button className={classes?.cancelButton} variant="ghost" />}
              >
                {cancelLabel}
              </HeadlessAlertDialog.Close>
              <Button
                className={classes?.confirmButton}
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
