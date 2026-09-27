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

export type DesignWorkbenchMode = "describe" | "design" | "review";

export interface DesignWorkbenchLabels {
  readonly mode: string;
  readonly describe: string;
  readonly design: string;
  readonly review: string;
  readonly rail: string;
  readonly editor: string;
  readonly reviewPanel: string;
}

export interface DesignWorkbenchProps {
  readonly mode: DesignWorkbenchMode;
  readonly onModeChange: (mode: DesignWorkbenchMode) => void;
  readonly labels: DesignWorkbenchLabels;
  readonly rail: ReactNode;
  readonly editor: ReactNode;
  readonly review: ReactNode;
  readonly footer?: ReactNode;
  readonly railPosition?: "start" | "end";
  readonly className?: string;
}

/**
 * Product-neutral natural-language authoring composition.
 *
 * Products own conversation transport, candidate state, drafts, validation,
 * authorization and every durable action. This component owns only the shared
 * desktop split and the controlled Describe / Design / Review mobile view.
 */
export function DesignWorkbench({
  mode,
  onModeChange,
  labels,
  rail,
  editor,
  review,
  footer,
  railPosition = "start",
  className,
}: DesignWorkbenchProps) {
  const modes: readonly DesignWorkbenchMode[] = ["describe", "design", "review"];
  return (
    <div
      className={cx("ui-design-workbench", className)}
      data-mode={mode}
      data-rail-position={railPosition}
    >
      <div aria-label={labels.mode} className="ui-design-workbench__modes" role="group">
        {modes.map((item) => (
          <button
            aria-pressed={mode === item}
            className="ui-design-workbench__mode"
            key={item}
            onClick={() => onModeChange(item)}
            type="button"
          >
            {labels[item]}
          </button>
        ))}
      </div>
      <section
        aria-label={labels.rail}
        className="ui-design-workbench__pane ui-design-workbench__rail"
        data-design-pane="describe"
      >
        {rail}
      </section>
      <section
        aria-label={labels.editor}
        className="ui-design-workbench__pane ui-design-workbench__editor"
        data-design-pane="design"
      >
        {editor}
      </section>
      <section
        aria-label={labels.reviewPanel}
        className="ui-design-workbench__pane ui-design-workbench__review"
        data-design-pane="review"
      >
        {review}
      </section>
      {footer ? <footer className="ui-design-workbench__footer">{footer}</footer> : null}
    </div>
  );
}
