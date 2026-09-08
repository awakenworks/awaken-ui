import { ChevronDown, ChevronRight } from "../icons/index.js";
import { useState } from "react";
import { Button } from "../primitives/button.js";
import { cx } from "../internal/cx.js";
import { CopyButton } from "../primitives/copy-button.js";

export type JsonInspectorLabels = {
  readonly summary: string;
  readonly copy: string;
  readonly copied: string;
};

export type JsonInspectorClasses = {
  readonly root?: string | undefined;
  readonly header?: string | undefined;
  readonly toggle?: string | undefined;
  readonly copy?: string | undefined;
  readonly body?: string | undefined;
};

export type JsonInspectorProps = {
  readonly value: unknown;
  readonly collapsed?: boolean | undefined;
  readonly labels?: Partial<JsonInspectorLabels> | undefined;
  readonly classes?: JsonInspectorClasses | undefined;
  readonly stringify?: ((value: unknown) => string) | undefined;
};

const DEFAULT_LABELS: JsonInspectorLabels = {
  summary: "JSON",
  copy: "Copy",
  copied: "Copied",
};

export function JsonInspector({
  value,
  collapsed = false,
  labels,
  classes,
  stringify = (input) => JSON.stringify(input, null, 2) ?? "undefined",
}: JsonInspectorProps) {
  const [open, setOpen] = useState(!collapsed);
  const text = stringify(value);
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <div className={cx("ui-json-inspector", classes?.root)}>
      <div className={cx("ui-json-inspector__header", classes?.header)}>
        <Button
          variant="ghost"
          type="button"
          aria-expanded={open}
          className={cx("ui-json-inspector__toggle", classes?.toggle)}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <ChevronDown /> : <ChevronRight />}
          {resolvedLabels.summary}
        </Button>
        <CopyButton
          className={cx("ui-json-inspector__copy", classes?.copy)}
          copiedIcon={resolvedLabels.copied}
          copiedLabel={resolvedLabels.copied}
          icon={resolvedLabels.copy}
          label={resolvedLabels.copy}
          value={text}
        />
      </div>
      {open ? <pre className={cx("ui-json-inspector__body", classes?.body)}>{text}</pre> : null}
    </div>
  );
}
