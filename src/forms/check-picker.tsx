import type { ReactNode } from "react";
import { cx } from "../internal/cx.js";

export interface CheckPickerOption {
  readonly id: string;
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly disabled?: boolean;
}

export interface CheckPickerClasses {
  readonly root?: string;
  readonly row?: string;
  readonly label?: string;
  readonly description?: string;
  readonly empty?: string;
}

export interface CheckPickerProps {
  readonly options: readonly CheckPickerOption[];
  readonly selected: readonly string[];
  readonly onChange: (next: string[]) => void;
  readonly empty?: ReactNode;
  readonly className?: string;
  readonly classes?: CheckPickerClasses;
}

/** Controlled multi-select list; option order is preserved in emitted values. */
export function CheckPicker({
  options,
  selected,
  onChange,
  empty = "—",
  className,
  classes,
}: CheckPickerProps) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  };
  if (options.length === 0) {
    return <span className={cx("ui-check-picker__empty", classes?.empty)}>{empty}</span>;
  }
  return (
    <div className={cx("ui-check-picker", classes?.root, className)}>
      {options.map((option) => (
        <label className={cx("ui-check-picker__row", classes?.row)} key={option.id}>
          <input
            checked={selected.includes(option.id)}
            disabled={option.disabled}
            onChange={() => toggle(option.id)}
            type="checkbox"
          />
          <span className={cx("ui-check-picker__label", classes?.label)}>
            {option.label ?? option.id}
          </span>
          {option.description ? (
            <span className={cx("ui-check-picker__description", classes?.description)}>
              {option.description}
            </span>
          ) : null}
        </label>
      ))}
    </div>
  );
}
