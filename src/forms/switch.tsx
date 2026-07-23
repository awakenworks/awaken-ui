import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { cx } from "../internal/cx.js";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  readonly label?: string | undefined;
  readonly onCheckedChange?: ((checked: boolean) => void) | undefined;
};

export function Switch({
  className,
  label,
  onChange,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    if (!event.defaultPrevented) {
      onCheckedChange?.(event.currentTarget.checked);
    }
  };

  return (
    <input
      {...props}
      type="checkbox"
      role="switch"
      aria-label={props["aria-label"] ?? label}
      className={cx("ui-switch", className)}
      onChange={handleChange}
    />
  );
}
