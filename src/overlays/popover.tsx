import {
  useState,
  useRef,
  useCallback,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import { HeadlessPopover } from "../internal/headless/popover.js";
import { cx } from "../internal/cx.js";

export type PopoverRole = "dialog" | "menu" | "listbox";
export type PopoverPlacement = "bottom-end" | "bottom-start";

export interface PopoverProps {
  readonly children: ReactElement;
  readonly content: ReactNode;
  readonly placement?: PopoverPlacement;
  readonly closeOnContentClick?: boolean;
  readonly "aria-label"?: string;
  readonly role?: PopoverRole;
  readonly className?: string;
  readonly contentClassName?: string;
  readonly contentId?: string;
  readonly rootProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;
  readonly closeOnMouseLeave?: boolean;
}

export type MenuPopoverProps = Omit<PopoverProps, "role" | "aria-label"> & {
  readonly "aria-label": string;
};

export function MenuPopover(props: MenuPopoverProps) {
  return <Popover {...props} role="menu" />;
}

/**
 * Product-neutral anchored surface. Base UI owns positioning, focus,
 * dismissal, and trigger ARIA; this layer adds the shared menu keyboard and
 * close-after-action contracts used across products.
 */
export function Popover({
  children,
  content,
  placement = "bottom-start",
  closeOnContentClick = false,
  "aria-label": ariaLabel,
  role = "dialog",
  className,
  contentClassName,
  contentId,
  rootProps,
  closeOnMouseLeave = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const align = placement === "bottom-end" ? "end" : "start";

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (!node || !open) return;
      node
        .querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    },
    [open],
  );

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (role === "dialog") return;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="menuitem"]:not([aria-disabled="true"]), [role="option"]:not([aria-disabled="true"])',
      ),
    );
    if (items.length === 0) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? current < 0
              ? 0
              : (current + 1) % items.length
            : current <= 0
              ? items.length - 1
              : current - 1;
    items[next]?.focus();
  };

  return (
    <HeadlessPopover.Root
      modal="trap-focus"
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) triggerRef.current?.focus();
      }}
      open={open}
    >
      <div
        {...rootProps}
        className={cx("ui-popover", className)}
        onMouseLeave={(event) => {
          rootProps?.onMouseLeave?.(event);
          if (closeOnMouseLeave) setOpen(false);
        }}
        ref={rootRef}
      >
        <HeadlessPopover.Trigger
          aria-haspopup={role}
          ref={triggerRef}
          render={children}
          nativeButton
        />
        <HeadlessPopover.Portal container={rootRef}>
          <HeadlessPopover.Positioner
            align={align}
            className="ui-popover__positioner"
            side="bottom"
            sideOffset={8}
          >
            <HeadlessPopover.Popup
            aria-label={ariaLabel}
            className={cx(
              "ui-popover__content",
              `ui-popover__content--${placement}`,
              contentClassName,
            )}
              id={contentId}
              initialFocus
            onClick={
              closeOnContentClick
                ? (((event) => {
                    if ((event.target as HTMLElement).closest("button")) setOpen(false);
                  }) as MouseEventHandler<HTMLDivElement>)
                : undefined
            }
              onKeyDown={onPanelKeyDown}
              ref={setPanelRef}
              role={role}
            >
              {content}
            </HeadlessPopover.Popup>
          </HeadlessPopover.Positioner>
        </HeadlessPopover.Portal>
      </div>
    </HeadlessPopover.Root>
  );
}
