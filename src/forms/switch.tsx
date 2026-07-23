import { cx } from "../internal/cx.js";

export type SwitchProps = {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-on={checked || undefined}
      className={cx("ui-switch", className)}
      onClick={() => onChange(!checked)}
    >
      <span className="ui-switch__knob" aria-hidden="true" />
    </button>
  );
}
