import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "../internal/cx.js";

export type FieldContext = {
  readonly describedBy: string | undefined;
  readonly id: string;
  readonly invalid: boolean;
};

export type FieldProps = {
  readonly children: (context: FieldContext) => ReactNode;
  readonly label: ReactNode;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly info?: string | undefined;
  readonly required?: boolean | undefined;
  readonly className?: string;
  readonly labelClassName?: string;
  readonly helpClassName?: string;
  readonly errorClassName?: string;
  readonly labelAs?: "label" | "div";
};

export function Field({
  children,
  label,
  error,
  help,
  info,
  required,
  className,
  labelClassName,
  helpClassName,
  errorClassName,
  labelAs = "label",
}: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const labelContent = <>{label}{info ? <span aria-label={info} className="ui-field__info" role="img" title={info}>ⓘ</span> : null}</>;
  return (
    <div className={cx("ui-field", error !== undefined && "ui-field--invalid", className)}>
      {labelAs === "label" ? (
        <label className={cx("ui-field__label", labelClassName)} data-required={required || undefined} htmlFor={id}>{labelContent}</label>
      ) : <div className={cx("ui-field__label", labelClassName)} data-required={required || undefined}>{labelContent}</div>}
      {children({ describedBy, id, invalid: error !== undefined })}
      {help === undefined ? null : <span className={cx("ui-field__help", helpClassName)} id={helpId}>{help}</span>}
      {error === undefined ? null : <span className={cx("ui-field__error", errorClassName)} id={errorId}>{error}</span>}
    </div>
  );
}

type CommonFieldProps = {
  readonly label: ReactNode;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly info?: string | undefined;
};

export function TextField({ label, error, help, info, className, ...props }: InputHTMLAttributes<HTMLInputElement> & CommonFieldProps) {
  return <Field label={label} error={error} help={help} info={info} required={props.required}>
    {({ describedBy, id, invalid }) => <input {...props} id={id} className={cx("ui-input", className)} aria-describedby={describedBy} aria-invalid={invalid} />}
  </Field>;
}

export function TextAreaField({ label, error, help, info, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & CommonFieldProps) {
  return <Field label={label} error={error} help={help} info={info} required={props.required}>
    {({ describedBy, id, invalid }) => <textarea {...props} id={id} className={cx("ui-input", "ui-input--area", className)} aria-describedby={describedBy} aria-invalid={invalid} />}
  </Field>;
}

export function SelectField({ label, error, help, info, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & CommonFieldProps) {
  return <Field label={label} error={error} help={help} info={info} required={props.required}>
    {({ describedBy, id, invalid }) => <select {...props} id={id} className={cx("ui-input", className)} aria-describedby={describedBy} aria-invalid={invalid}>{children}</select>}
  </Field>;
}

export function CheckboxField({
  label,
  help,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { readonly label: ReactNode; readonly help?: ReactNode }) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div className={cx("ui-checkbox", className)}>
      <label className="ui-checkbox__row" htmlFor={id}>
        <input {...props} type="checkbox" id={id} aria-describedby={helpId} className="ui-checkbox__box" />
        <span className="ui-checkbox__label">{label}</span>
      </label>
      {help === undefined ? null : <span className="ui-field__help" id={helpId}>{help}</span>}
    </div>
  );
}
