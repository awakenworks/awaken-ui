import { useId, useState, type ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { SegmentedControl } from "./segmented-control.js";

export type SecretMode = "keep" | "replace" | "clear";

export interface SecretIntent {
  readonly mode: SecretMode;
  readonly value?: string;
}

export interface SecretFieldLabels {
  readonly modeLabel?: string;
  readonly keep: ReactNode;
  readonly replace: ReactNode;
  readonly clear: ReactNode;
  readonly placeholder: string;
  readonly kept: ReactNode;
  readonly cleared: ReactNode;
}

export interface SecretFieldClasses {
  readonly root?: string;
  readonly label?: string;
  readonly modes?: string;
  readonly modeButton?: string;
  readonly activeMode?: string;
  readonly inactiveMode?: string;
  readonly input?: string;
  readonly status?: string;
}

export interface SecretFieldProps {
  readonly label: ReactNode;
  readonly hasStored: boolean;
  readonly onChange: (intent: SecretIntent) => void;
  readonly labels: SecretFieldLabels;
  readonly placeholder?: string;
  readonly classes?: SecretFieldClasses;
}

/** Write-only keep/replace/clear editor; stored secret values never enter props. */
export function SecretField({
  label,
  hasStored,
  onChange,
  labels,
  placeholder,
  classes,
}: SecretFieldProps) {
  const inputId = useId();
  const [mode, setMode] = useState<SecretMode>(hasStored ? "keep" : "replace");
  const [value, setValue] = useState("");
  const pick = (nextMode: SecretMode) => {
    setMode(nextMode);
    onChange(
      nextMode === "replace"
        ? { mode: "replace", value }
        : { mode: nextMode },
    );
  };
  const options = (hasStored
    ? ["keep", "replace", "clear"]
    : ["replace"]) as SecretMode[];
  return (
    <div className={cx("ui-field", "ui-secret-field", classes?.root)}>
      <label className={cx("ui-field__label", classes?.label)} htmlFor={inputId}>{label}</label>
      {hasStored ? (
        <SegmentedControl
          {...(labels.modeLabel ? { ariaLabel: labels.modeLabel } : {})}
          onChange={pick}
          options={options.map((value) => ({ value, label: labels[value] }))}
          value={mode}
          {...(classes?.activeMode ? { activeClassName: classes.activeMode } : {})}
          {...(classes?.modeButton ? { buttonClassName: classes.modeButton } : {})}
          {...(classes?.modes ? { className: classes.modes } : {})}
          {...(classes?.inactiveMode ? { inactiveClassName: classes.inactiveMode } : {})}
        />
      ) : null}
      {mode === "replace" ? (
        <input
          id={inputId}
          autoComplete="off"
          className={cx("ui-input", "ui-secret-field__input", classes?.input)}
          onChange={(event) => {
            setValue(event.target.value);
            onChange({ mode: "replace", value: event.target.value });
          }}
          placeholder={placeholder ?? labels.placeholder}
          type="password"
          value={value}
        />
      ) : (
        <span className={cx("ui-secret-field__status", classes?.status)}>
          {mode === "keep" ? labels.kept : labels.cleared}
        </span>
      )}
    </div>
  );
}
