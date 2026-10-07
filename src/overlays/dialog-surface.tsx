import {
  createElement,
  useCallback,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { HeadlessDialog, modalOpenChange } from "../internal/headless/dialog.js";

export interface DialogSurfaceProps {
  readonly open: boolean;
  /** Return false to decline dismissal without processing close focus. */
  readonly onOpenChange: (open: boolean) => void;
  readonly children: ReactNode;
  readonly rootClassName?: string;
  readonly panelClassName: string;
  readonly overlayClassName?: string;
  readonly panelAs?: "div" | "section";
  readonly panelRef?: RefObject<HTMLElement | null>;
  readonly labelledBy?: string;
  readonly ariaLabel?: string;
  readonly closeOnBackdrop?: boolean;
  readonly panelProps?: Omit<
    HTMLAttributes<HTMLElement>,
    "aria-label" | "aria-labelledby" | "children" | "className" | "role"
  >;
}

/**
 * Behavior-only modal boundary for product-specific surfaces. Products own
 * markup classes and tokens; Base UI owns focus, Escape, outside dismissal,
 * portal lifecycle, scroll locking, and focus restoration.
 */
export function DialogSurface({
  open,
  onOpenChange,
  children,
  rootClassName,
  panelClassName,
  overlayClassName,
  panelAs = "div",
  panelRef,
  labelledBy,
  ariaLabel,
  closeOnBackdrop = true,
  panelProps,
}: DialogSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (panelRef) panelRef.current = node;
    },
    [panelRef],
  );

  if (!open) return null;

  return (
    <div
      className={rootClassName}
      ref={rootRef}
      role="presentation"
    >
      <HeadlessDialog.Root
        disablePointerDismissal={!closeOnBackdrop}
        onOpenChange={modalOpenChange(onOpenChange)}
        open={open}
      >
        <HeadlessDialog.Portal
          className="ui-dialog-surface__portal"
          container={rootRef}
        >
          {overlayClassName ? (
            <HeadlessDialog.Backdrop
              className={overlayClassName}
            />
          ) : null}
          <HeadlessDialog.Viewport className="ui-dialog-surface__viewport">
            <HeadlessDialog.Popup
              {...panelProps}
              aria-label={ariaLabel}
              aria-labelledby={labelledBy}
              className={panelClassName}
              ref={setPanelRef}
              render={createElement(panelAs)}
            >
              {children}
            </HeadlessDialog.Popup>
          </HeadlessDialog.Viewport>
        </HeadlessDialog.Portal>
      </HeadlessDialog.Root>
    </div>
  );
}
