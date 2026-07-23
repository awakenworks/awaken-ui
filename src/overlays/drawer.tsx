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
export type DrawerClasses = {
  readonly backdrop?: string;
  readonly viewport?: string;
  readonly panel?: string;
  readonly header?: string;
  readonly title?: string;
  readonly body?: string;
  readonly footer?: string;
  readonly closeButton?: string;
};

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
  readonly titleId?: string;
  readonly closeIcon?: ReactNode;
  readonly classes?: DrawerClasses;
}

/** A modal side panel for detail and management surfaces. */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(
    {
      children,
      className,
      classes,
      closeLabel,
      closeIcon,
      closeOnOutsidePress = true,
      description,
      footer,
      onOpenChange,
      open,
      side = "end",
      size = "md",
      title,
      titleId: suppliedTitleId,
      ...props
    },
    ref,
  ) {
    const generatedTitleId = useId();
    const titleId = suppliedTitleId ?? generatedTitleId;
    const descriptionId = useId();
    return (
      <HeadlessDialog.Root
        disablePointerDismissal={!closeOnOutsidePress}
        onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
        open={open}
      >
        <HeadlessDialog.Portal>
          <HeadlessDialog.Backdrop className={cx("ui-overlay__backdrop", classes?.backdrop)} />
          <HeadlessDialog.Viewport className={cx("ui-drawer__viewport", classes?.viewport)}>
            <HeadlessDialog.Popup
              {...props}
              aria-describedby={description ? descriptionId : undefined}
              aria-labelledby={titleId}
              className={cx("ui-drawer", classes?.panel, className)}
              data-side={side}
              data-size={size}
              ref={ref}
            >
              <header className={cx("ui-dialog__header", classes?.header)}>
                <div className="ui-dialog__heading">
                  <HeadlessDialog.Title className={cx("ui-dialog__title", classes?.title)} id={titleId}>
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
                  render={<Button className={classes?.closeButton} variant="icon" size="sm" />}
                >
                  {closeIcon ?? <span aria-hidden="true">×</span>}
                </HeadlessDialog.Close>
              </header>
              <div className={cx("ui-dialog__body", classes?.body)}>{children}</div>
              {footer ? <footer className={cx("ui-dialog__footer", classes?.footer)}>{footer}</footer> : null}
            </HeadlessDialog.Popup>
          </HeadlessDialog.Viewport>
        </HeadlessDialog.Portal>
      </HeadlessDialog.Root>
    );
  },
);
