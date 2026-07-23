import type { ReactNode } from "react";
import { cx } from "../internal/cx.js";
import { Button } from "../primitives/button.js";

export interface AuthoringHeaderProps {
  readonly backLabel: string;
  readonly backIcon?: ReactNode;
  readonly onBack: () => void;
  readonly identity: ReactNode;
  readonly name: string;
  readonly nameLabel: string;
  readonly onNameChange: (value: string) => void;
  readonly nameSize?: number;
  readonly placeholder?: string;
  readonly metadata?: ReactNode;
  readonly windowed: boolean;
  readonly onWindowedChange: (windowed: boolean) => void;
  readonly maximizeLabel: string;
  readonly maximizeIcon?: ReactNode;
  readonly restoreLabel: string;
  readonly restoreIcon?: ReactNode;
  readonly closeLabel: string;
  readonly closeIcon?: ReactNode;
  readonly actionButtonClassName?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function AuthoringHeader({
  backLabel,
  backIcon,
  onBack,
  identity,
  name,
  nameLabel,
  onNameChange,
  nameSize,
  placeholder,
  metadata,
  windowed,
  onWindowedChange,
  maximizeLabel,
  maximizeIcon,
  restoreLabel,
  restoreIcon,
  closeLabel,
  closeIcon,
  actionButtonClassName,
  onClose,
  children,
}: AuthoringHeaderProps) {
  const windowLabel = windowed ? maximizeLabel : restoreLabel;
  return (
    <header className="ui-authoring-header">
      <button className="ui-authoring-header__back" onClick={onBack} type="button">
        {backIcon} {backLabel}
      </button>
      {identity}
      <input
        aria-label={nameLabel}
        className="ui-authoring-header__name"
        onChange={(event) => onNameChange(event.target.value)}
        placeholder={placeholder}
        size={nameSize}
        value={name}
      />
      {metadata}
      <span className="ui-authoring-header__spacer" />
      <div className="ui-authoring-header__actions">
        <Button
          aria-label={windowLabel}
          className={actionButtonClassName}
          icon={windowed ? maximizeIcon : restoreIcon}
          onClick={() => onWindowedChange(!windowed)}
          size="sm"
          title={windowLabel}
          variant="icon"
        />
        {children}
        <Button
          aria-label={closeLabel}
          className={actionButtonClassName}
          icon={closeIcon}
          onClick={onClose}
          size="sm"
          title={closeLabel}
          variant="icon"
        />
      </div>
    </header>
  );
}

export interface AuthoringGuideStep<Key extends string> {
  readonly key: Key;
  readonly label: ReactNode;
  readonly complete: boolean;
}

export interface AuthoringGuideProps<Key extends string> {
  readonly label: string;
  readonly steps: ReadonlyArray<AuthoringGuideStep<Key>>;
  readonly onSelect: (key: Key) => void;
  readonly completeIcon?: ReactNode;
  readonly incompleteIcon?: ReactNode;
  readonly blocked?: ReactNode;
  readonly className?: string;
}

export function AuthoringGuide<Key extends string>({
  label,
  steps,
  onSelect,
  completeIcon,
  incompleteIcon,
  blocked,
  className,
}: AuthoringGuideProps<Key>) {
  const currentIndex = Math.max(0, steps.findIndex((step) => !step.complete));
  return (
    <nav aria-label={label} className={cx("ui-authoring-guide", className)}>
      {steps.map((step, index) => (
        <button
          className={cx(
            "ui-authoring-guide__step",
            step.complete && "is-complete",
            index === currentIndex && "is-current",
          )}
          key={step.key}
          onClick={() => onSelect(step.key)}
          type="button"
        >
          {step.complete ? completeIcon : incompleteIcon}
          <span>{index + 1}. {step.label}</span>
        </button>
      ))}
      {blocked ? <span className="ui-authoring-guide__blocked">{blocked}</span> : null}
    </nav>
  );
}
