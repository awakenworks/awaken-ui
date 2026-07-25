import type { CSSProperties, ReactNode } from "react";
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
  readonly inactiveClassName?: string;
  readonly buttonStyle?: CSSProperties;
  readonly as?: "div" | "span";
  readonly ariaLabel?: string;
  readonly activeDataAttribute?: `data-${string}`;
};

export function SegmentedControl<T extends string | number | boolean>({
  options,
  value,
  onChange,
  className,
  buttonClassName,
  activeClassName,
  inactiveClassName,
  buttonStyle,
  as: Container = "div",
  ariaLabel,
  activeDataAttribute,
}: SegmentedControlProps<T>) {
  return (
    <Container className={cx("ui-segmented", className)} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        const activeData = activeDataAttribute
          ? { [activeDataAttribute]: active || undefined }
          : {};
        return <button
          {...activeData}
          key={String(option.value)}
          type="button"
          className={cx(
            "ui-segmented__btn",
            buttonClassName,
            active ? cx("is-active", activeClassName) : inactiveClassName,
          )}
          style={buttonStyle}
          aria-pressed={active}
          aria-label={option.ariaLabel}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
        >{option.label}</button>;
      })}
    </Container>
  );
}
