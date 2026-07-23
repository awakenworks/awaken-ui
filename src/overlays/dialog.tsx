import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { HeadlessDialog } from "../internal/headless/dialog.js";
import { cx } from "../internal/cx.js";
import { Button } from "../primitives/button.js";

export type OverlaySize = "sm" | "md" | "lg";

export interface DialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: OverlaySize;
  readonly closeLabel: string;
  readonly closeOnOutsidePress?: boolean;
  readonly initialFocus?: boolean;
}

/**
 * Product-neutral modal dialog. The consumer owns copy and domain actions;
 * this component owns modal focus, dismissal, portal, and ARIA structure.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(
    {
      children,
      className,
      closeLabel,
      closeOnOutsidePress = true,
      description,
      footer,
      initialFocus = true,
      onOpenChange,
      open,
      size = "md",
      title,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const descriptionId = useId();
    return (
      <HeadlessDialog.Root
        disablePointerDismissal={!closeOnOutsidePress}
        onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
        open={open}
      >
        <HeadlessDialog.Portal>
          <HeadlessDialog.Backdrop className="ui-overlay__backdrop" />
          <HeadlessDialog.Viewport className="ui-overlay__viewport">
            <HeadlessDialog.Popup
              {...props}
              aria-describedby={description ? descriptionId : undefined}
              aria-labelledby={titleId}
              className={cx("ui-dialog", className)}
              data-size={size}
              initialFocus={initialFocus}
              ref={ref}
            >
              <header className="ui-dialog__header">
                <div className="ui-dialog__heading">
                  <HeadlessDialog.Title className="ui-dialog__title" id={titleId}>
                    {title}
                  </HeadlessDialog.Title>
                  {description ? (
                    <HeadlessDialog.Description
                      className="ui-dialog__description"
                      id={descriptionId}
                    >
                      {description}
                    </HeadlessDialog.Description>
                  ) : null}
                </div>
                <HeadlessDialog.Close
                  aria-label={closeLabel}
                  render={<Button variant="icon" size="sm" />}
                >
                  <span aria-hidden="true">×</span>
                </HeadlessDialog.Close>
              </header>
              <div className="ui-dialog__body">{children}</div>
              {footer ? <footer className="ui-dialog__footer">{footer}</footer> : null}
            </HeadlessDialog.Popup>
          </HeadlessDialog.Viewport>
        </HeadlessDialog.Portal>
      </HeadlessDialog.Root>
    );
  },
);

