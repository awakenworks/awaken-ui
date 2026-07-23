import type { FormEvent, ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Button } from "../primitives/button.js";

export interface EditorFormClasses {
  readonly form?: string;
  readonly actions?: string;
  readonly split?: string;
  readonly formPane?: string;
  readonly assistantPane?: string;
}

export interface EditorFormProps {
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onCancel: () => void;
  readonly error?: ReactNode;
  readonly errorPrefix?: ReactNode;
  readonly pending: boolean;
  readonly cancelLabel: ReactNode;
  readonly submitLabel: ReactNode;
  readonly submitIcon?: ReactNode;
  readonly submitDisabled?: boolean;
  readonly children: ReactNode;
  readonly assistant?: ReactNode;
  readonly classes?: EditorFormClasses;
}

/** Product-neutral form lifecycle/chrome used inside editor dialogs. */
export function EditorForm({
  onSubmit,
  onCancel,
  error,
  errorPrefix,
  pending,
  cancelLabel,
  submitLabel,
  submitIcon,
  submitDisabled,
  children,
  assistant,
  classes,
}: EditorFormProps) {
  const form = (
    <form className={classes?.form} noValidate onSubmit={onSubmit}>
      {children}
      {error ? (
        <div className="ui-state ui-state--danger" role="alert">
          <p>{errorPrefix ? <>{errorPrefix} </> : null}{error}</p>
        </div>
      ) : null}
      <div className={classes?.actions}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={pending}
          disabled={submitDisabled}
          {...(submitIcon ? { icon: submitIcon } : {})}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
  if (!assistant) return form;
  return (
    <div className={cx("ui-editor-form-split", classes?.split)}>
      <div className={cx("ui-editor-form-split__form", classes?.formPane)}>{form}</div>
      <div className={cx("ui-editor-form-split__assistant", classes?.assistantPane)}>
        {assistant}
      </div>
    </div>
  );
}
