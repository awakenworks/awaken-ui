import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../internal/cx.js";

export type SegmentedControlOption<T> = {
  readonly value: T;
  readonly label: ReactNode;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
};

export type SegmentedControlProps<T extends string | number | boolean> = {
  readonly options: ReadonlyArray<SegmentedControlOption<T>>;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly className?: string;
  readonly buttonClassName?: string;
  readonly activeClassName?: string;
  readonly buttonStyle?: CSSProperties;
  readonly as?: "div" | "span";
  readonly role?: "group" | "tablist";
  readonly buttonRole?: "tab";
  readonly selectionAria?: "pressed" | "selected";
  readonly ariaLabel?: string;
};

export function SegmentedControl<T extends string | number | boolean>({
  options,
  value,
  onChange,
  className,
  buttonClassName,
  activeClassName,
  buttonStyle,
  as: Container = "div",
  role,
  buttonRole,
  selectionAria = "pressed",
  ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (role !== "tablist" || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const enabled = options.map((option, index) => ({ option, index })).filter(({ option }) => !option.disabled);
    if (enabled.length === 0) return;
    event.preventDefault();
    const focused = enabled.findIndex(({ index }) => buttonsRef.current[index] === document.activeElement);
    const active = focused >= 0 ? focused : enabled.findIndex(({ option }) => option.value === value);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1
      : event.key === "ArrowRight" || event.key === "ArrowDown" ? (active + 1) % enabled.length
      : active <= 0 ? enabled.length - 1 : active - 1;
    const next = enabled[nextIndex];
    if (!next) return;
    buttonsRef.current[next.index]?.focus();
    onChange(next.option.value);
  };
  return (
    <Container className={cx("ui-segmented", className)} role={role} aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {options.map((option, index) => {
        const active = option.value === value;
        return <button
          key={String(option.value)}
          type="button"
          ref={(node) => { buttonsRef.current[index] = node; }}
          role={buttonRole}
          className={cx("ui-segmented__btn", buttonClassName, active && "is-active", active && activeClassName)}
          style={buttonStyle}
          aria-pressed={selectionAria === "pressed" ? active : undefined}
          aria-selected={selectionAria === "selected" ? active : undefined}
          aria-label={option.ariaLabel}
          disabled={option.disabled}
          tabIndex={buttonRole === "tab" ? (active && !option.disabled ? 0 : -1) : undefined}
          onClick={() => onChange(option.value)}
        >{option.label}</button>;
      })}
    </Container>
  );
}
