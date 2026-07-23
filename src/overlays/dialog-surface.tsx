import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { HeadlessDialog } from "../internal/headless/dialog.js";

export interface DialogSurfaceProps {
  readonly open: boolean;
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
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const activePanelRef = useRef<HTMLDivElement | null>(null);
  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (panelRef) panelRef.current = node;
      activePanelRef.current = node;
      if (!node || !open) return;
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      node
        .querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    },
    [open, panelRef],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const panel = activePanelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={rootClassName}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      ref={rootRef}
      role="presentation"
    >
      <HeadlessDialog.Root
        disablePointerDismissal={!closeOnBackdrop}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) returnFocusRef.current?.focus();
        }}
        open={open}
      >
        <HeadlessDialog.Portal
          className="ui-dialog-surface__portal"
          container={rootRef}
        >
          {overlayClassName ? (
            <HeadlessDialog.Backdrop
              className={overlayClassName}
              onMouseDown={
                closeOnBackdrop ? () => onOpenChange(false) : undefined
              }
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
