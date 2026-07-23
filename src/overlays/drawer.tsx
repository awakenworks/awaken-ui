import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { HeadlessDialog } from "../internal/headless/dialog.js";
import { cx } from "../internal/cx.js";
import { Button } from "../primitives/button.js";

export type DrawerSide = "start" | "end";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly side?: DrawerSide;
  readonly size?: DrawerSize;
  readonly closeLabel: string;
  readonly closeOnOutsidePress?: boolean;
}

/** A modal side panel for detail and management surfaces. */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(
    {
      children,
      className,
      closeLabel,
      closeOnOutsidePress = true,
      description,
      footer,
      onOpenChange,
      open,
      side = "end",
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
          <HeadlessDialog.Viewport className="ui-drawer__viewport">
            <HeadlessDialog.Popup
              {...props}
              aria-describedby={description ? descriptionId : undefined}
              aria-labelledby={titleId}
              className={cx("ui-drawer", className)}
              data-side={side}
              data-size={size}
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

