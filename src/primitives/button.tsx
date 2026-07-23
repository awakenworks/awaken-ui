import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../internal/cx.js";

export type ButtonVariant =
  | "default"
  | "primary"
  | "ghost"
  | "danger"
  | "icon";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: ReactNode;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      icon,
      loading = false,
      loadingLabel,
      size = "md",
      type = "button",
      variant = "default",
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        {...props}
        aria-busy={loading || undefined}
        className={cx("ui-button", className)}
        data-size={size}
        data-variant={variant}
        disabled={isDisabled}
        ref={ref}
        type={type}
      >
        {loading ? <span aria-hidden="true" className="ui-button__spinner" /> : icon}
        {loading && loadingLabel ? (
          <>
            <span className="ui-visually-hidden">{loadingLabel}</span>
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

