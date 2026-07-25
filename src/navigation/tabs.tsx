import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../internal/cx.js";

export type TabsActivationMode = "automatic" | "manual";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly activationMode?: TabsActivationMode;
  readonly orientation?: TabsOrientation;
};

type TabsContextValue = {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly activationMode: TabsActivationMode;
  readonly orientation: TabsOrientation;
  readonly id: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const value = useContext(TabsContext);
  if (!value) throw new Error("Tabs parts must be rendered inside Tabs.");
  return value;
}

function partId(root: string, part: "tab" | "panel", value: string) {
  return `${root}-${part}-${encodeURIComponent(value)}`;
}

export function Tabs({ value, onValueChange, activationMode = "automatic", orientation = "horizontal", className, children, ...props }: TabsProps) {
  const id = useId();
  return <TabsContext.Provider value={{ value, onValueChange, activationMode, orientation, id }}>
    <div {...props} className={cx("ui-tabs", className)} data-orientation={orientation}>{children}</div>
  </TabsContext.Provider>;
}

export function TabList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { orientation } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]:not(:disabled)") ?? []);
    if (tabs.length > 0 && !tabs.some((tab) => tab.tabIndex === 0)) tabs[0]?.setAttribute("tabindex", "0");
  });
  return <div ref={listRef} {...props} className={cx("ui-tabs__list", className)} role="tablist" aria-orientation={orientation} />;
}

export type TabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> & { readonly value: string };

export function Tab({ value, className, disabled, onClick, onKeyDown, ...props }: TabProps) {
  const context = useTabsContext();
  const selected = context.value === value;
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const forward = context.orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const backward = context.orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    if (![forward, backward, "Home", "End"].includes(event.key)) return;
    const list = event.currentTarget.closest<HTMLElement>("[role=tablist]");
    const tabs = Array.from(list?.querySelectorAll<HTMLButtonElement>("[role=tab]:not(:disabled)") ?? []);
    const current = tabs.indexOf(event.currentTarget);
    if (current < 0 || tabs.length === 0) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
      : event.key === forward ? (current + 1) % tabs.length
      : (current - 1 + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
    next?.focus();
    if (context.activationMode === "automatic") next?.click();
  };
  return <button
    {...props}
    type="button"
    role="tab"
    id={partId(context.id, "tab", value)}
    aria-controls={partId(context.id, "panel", value)}
    aria-selected={selected}
    disabled={disabled}
    tabIndex={selected && !disabled ? 0 : -1}
    className={cx("ui-tabs__tab", className)}
    onKeyDown={handleKeyDown}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) context.onValueChange(value); }}
  />;
}

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & { readonly value: string; readonly children?: ReactNode };

export function TabPanel({ value, className, ...props }: TabPanelProps) {
  const context = useTabsContext();
  const selected = context.value === value;
  return <div
    {...props}
    role="tabpanel"
    id={partId(context.id, "panel", value)}
    aria-labelledby={partId(context.id, "tab", value)}
    className={cx("ui-tabs__panel", className)}
    hidden={!selected}
    tabIndex={0}
  />;
}
