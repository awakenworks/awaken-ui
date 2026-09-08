import { Info } from "../icons/index.js";
import {
  forwardRef,
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
  readonly label?: ReactNode;
  readonly action?: ReactNode;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly info?: string | undefined;
  readonly required?: boolean | undefined;
  readonly className?: string | undefined;
  readonly labelClassName?: string | undefined;
  readonly helpClassName?: string | undefined;
  readonly errorClassName?: string | undefined;
  readonly labelAs?: "label" | "div";
  readonly controlId?: string | undefined;
};

export function Field({
  children,
  label,
  action,
  error,
  help,
  info,
  required,
  className,
  labelClassName,
  helpClassName,
  errorClassName,
  labelAs = "label",
  controlId,
}: FieldProps) {
  const generatedId = useId();
  const id = controlId ?? generatedId;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const labelContent = (
    <>
      <span>{label}{info ? <span className="ui-field__info" title={info}><Info label={info} /></span> : null}</span>
      {action}
    </>
  );
  return (
    <div className={cx("ui-field", error !== undefined && "ui-field--invalid", className)}>
      {label === undefined ? null : labelAs === "label" ? (
        <label className={cx("ui-field__label", labelClassName)} data-required={required || undefined} htmlFor={id}>{labelContent}</label>
      ) : <div className={cx("ui-field__label", labelClassName)} data-required={required || undefined}>{labelContent}</div>}
      {children({ describedBy, id, invalid: error !== undefined })}
      {help === undefined ? null : <span className={cx("ui-field__help", helpClassName)} id={helpId}>{help}</span>}
      {error === undefined ? null : <span className={cx("ui-field__error", errorClassName)} id={errorId}>{error}</span>}
    </div>
  );
}

type CommonFieldProps = {
  readonly label?: ReactNode;
  readonly action?: ReactNode;
  readonly error?: ReactNode;
  readonly help?: ReactNode;
  readonly info?: string | undefined;
  readonly fieldClassName?: string | undefined;
  readonly labelClassName?: string | undefined;
  readonly helpClassName?: string | undefined;
};

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & CommonFieldProps>(
  function TextField({ label, action, error, help, info, fieldClassName, labelClassName, helpClassName, className, id, ...props }, ref) {
    return <Field className={fieldClassName} labelClassName={labelClassName} helpClassName={helpClassName} label={label} action={action} error={error} help={help} info={info} required={props.required} controlId={id}>
      {({ describedBy, id, invalid }) => <input {...props} ref={ref} id={id} className={cx("ui-input", className)} aria-describedby={describedBy} aria-invalid={invalid} />}
    </Field>;
  },
);

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & CommonFieldProps>(
  function TextAreaField({ label, action, error, help, info, fieldClassName, labelClassName, helpClassName, className, id, ...props }, ref) {
    return <Field className={fieldClassName} labelClassName={labelClassName} helpClassName={helpClassName} label={label} action={action} error={error} help={help} info={info} required={props.required} controlId={id}>
      {({ describedBy, id, invalid }) => <textarea {...props} ref={ref} id={id} className={cx("ui-input", "ui-input--area", className)} aria-describedby={describedBy} aria-invalid={invalid} />}
    </Field>;
  },
);

export const SelectField = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & CommonFieldProps>(
  function SelectField({ label, action, error, help, info, fieldClassName, labelClassName, helpClassName, className, children, id, ...props }, ref) {
    return <Field className={fieldClassName} labelClassName={labelClassName} helpClassName={helpClassName} label={label} action={action} error={error} help={help} info={info} required={props.required} controlId={id}>
      {({ describedBy, id, invalid }) => <select {...props} ref={ref} id={id} className={cx("ui-input", className)} aria-describedby={describedBy} aria-invalid={invalid}>{children}</select>}
    </Field>;
  },
);

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
