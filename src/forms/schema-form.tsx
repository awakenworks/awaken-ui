import { X } from "../icons/index.js";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "../primitives/button.js";
import { cx } from "../internal/cx.js";

export interface JsonSchema {
  readonly type?: string | readonly string[];
  readonly title?: string;
  readonly description?: string;
  readonly properties?: Readonly<Record<string, JsonSchema>>;
  readonly required?: readonly string[];
  readonly items?: JsonSchema;
  readonly enum?: readonly unknown[];
  readonly default?: unknown;
  readonly [key: string]: unknown;
}

export interface SchemaFormLabels {
  readonly invalidJson: string;
  readonly invalidType?: string;
  readonly addItem: string;
  readonly removeItem: string;
}

export interface SchemaFormClasses {
  readonly root?: string;
  readonly object?: string;
  readonly field?: string;
  readonly input?: string;
  readonly mono?: string;
  readonly row?: string;
  readonly muted?: string;
  readonly error?: string;
  readonly button?: string;
}

export interface SchemaFormProps {
  readonly schema: JsonSchema;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  /** Editing syntax/basic shape only, not full Schema or domain admission. */
  readonly onValidityChange?: (valid: boolean) => void;
  readonly presentation?: "form" | "source";
  readonly labels: SchemaFormLabels;
  readonly className?: string;
  readonly classes?: SchemaFormClasses;
}

export function stringControlForSchema(schema: JsonSchema): "input" | "textarea" {
  return schema.format === "textarea" ? "textarea" : "input";
}

function firstType(schema: JsonSchema): string | undefined {
  return typeof schema.type === "string" ? schema.type : schema.type?.[0];
}

function defaultFor(schema: JsonSchema): unknown {
  if (schema.default !== undefined) return schema.default;
  switch (firstType(schema)) {
    case "object": return {};
    case "array": return [];
    case "boolean": return false;
    case "number":
    case "integer": return 0;
    case "string": return schema.enum?.[0] ?? "";
    default: return null;
  }
}

function isStructurallyRenderable(schema: JsonSchema): boolean {
  if (schema.oneOf || schema.anyOf || schema.allOf || schema.$ref) return false;
  if (firstType(schema) === "object" && !Object.keys(schema.properties ?? {}).length && schema.additionalProperties !== false) return false;
  return ["object", "string", "number", "integer", "boolean", "array"].includes(
    firstType(schema) ?? "",
  );
}

type FieldPath = readonly (string | number)[];
interface JsonDraft { text: string; parsed: unknown; invalid: boolean; error?: "type" }
type Drafts = Readonly<Record<string, JsonDraft>>;

type NodeProps = {
  readonly schema: JsonSchema;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  readonly controlId: string;
  readonly path: FieldPath;
  readonly drafts: Drafts;
  readonly onDraft: (path: FieldPath, draft: JsonDraft) => void;
  readonly onRemoveRow: (path: FieldPath, index: number) => void;
  readonly labels: SchemaFormLabels;
  readonly classes: SchemaFormClasses | undefined;
};

function matchesRootType(schema: JsonSchema, value: unknown): boolean {
  if (!schema.type) return true;
  const types = typeof schema.type === "string" ? [schema.type] : schema.type;
  return types.some((type) => {
    switch (type) {
      case "null": return value === null;
      case "object": return Boolean(value) && typeof value === "object" && !Array.isArray(value);
      case "array": return Array.isArray(value);
      case "integer": return typeof value === "number" && Number.isInteger(value);
      case "number": return typeof value === "number" && Number.isFinite(value);
      case "boolean": return typeof value === "boolean";
      case "string": return typeof value === "string";
      default: return true;
    }
  });
}

function renderJsonFallback({ schema, value, onChange, controlId, path, drafts, onDraft, labels, classes }: NodeProps) {
  const key = JSON.stringify(path);
  const draft = drafts[key];
  const text = draft && (draft.invalid || JSON.stringify(draft.parsed) === JSON.stringify(value))
    ? draft.text : JSON.stringify(value ?? null, null, 2);
  return <div>
    <textarea id={controlId} aria-label={!path.length ? schema.title : undefined} className={cx("ui-input", "ui-schema__input", classes?.input, classes?.mono)}
      rows={4} value={text} aria-invalid={draft?.invalid || undefined}
      aria-describedby={draft?.invalid ? `${controlId}-error` : undefined}
      onChange={(event) => {
        const raw = event.target.value;
        let parsed: unknown;
        try { parsed = raw.trim() === "" ? null : JSON.parse(raw); }
        catch { onDraft(path, { text: raw, parsed: value, invalid: true }); return; }
        if (!matchesRootType(schema, parsed)) { onDraft(path, { text: raw, parsed: value, invalid: true, error: "type" }); return; }
        onDraft(path, { text: raw, parsed, invalid: false });
        onChange(parsed);
      }} />
    {draft?.invalid ? <span id={`${controlId}-error`} role="alert" className={cx("ui-schema__error", classes?.error)}>{draft.error === "type" ? labels.invalidType ?? labels.invalidJson : labels.invalidJson}</span> : null}
  </div>;
}

function renderSchemaNode(props: NodeProps) {
  const { schema, value, onChange, controlId, labels, classes } = props;
  if (!isStructurallyRenderable(schema) || (value !== undefined && !matchesRootType(schema, value))) return renderJsonFallback(props);
  const type = firstType(schema);
  const inputClass = cx("ui-input", "ui-schema__input", classes?.input);
  if (schema.enum) {
    return (
      <select id={controlId} className={inputClass} value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}>
        {schema.enum.map((option) => (
          <option key={String(option)} value={String(option)}>{String(option)}</option>
        ))}
      </select>
    );
  }
  if (type === "boolean") {
    return (
      <label className={cx("ui-schema__boolean", classes?.row)}>
        <input id={controlId} type="checkbox" checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)} />
        <span className={classes?.muted}>{schema.description ?? ""}</span>
      </label>
    );
  }
  if (type === "number" || type === "integer") {
    return (
      <input id={controlId} className={cx(inputClass, classes?.mono)} type="number"
        value={value === null || value === undefined ? "" : Number(value)}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} />
    );
  }
  if (type === "string") {
    return stringControlForSchema(schema) === "textarea" ? (
      <textarea id={controlId} className={cx(inputClass, classes?.mono)} rows={5}
        value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <input id={controlId} className={inputClass} value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)} />
    );
  }
  if (type === "array") {
    const items = schema.items ?? {};
    const array = Array.isArray(value) ? value : [];
    return (
      <div className="ui-schema__array">
        {array.map((item, index) => (
          <div className={cx("ui-schema__array-row", classes?.row)} key={index}>
            <div className="ui-schema__array-value">
              {renderSchemaNode({ ...props, schema: items, value: item, path: [...props.path, index],
                controlId: `${controlId}-${index}`,
                onChange: (next) => onChange(array.map((current, currentIndex) => currentIndex === index ? next : current)),
              })}
            </div>
            <Button aria-label={labels.removeItem} className={classes?.button} type="button"
              onClick={() => { onChange(array.filter((_, currentIndex) => currentIndex !== index)); props.onRemoveRow(props.path, index); }}><X /></Button>
          </div>
        ))}
        <Button className={classes?.button} type="button"
          onClick={() => onChange([...array, defaultFor(items)])}>{labels.addItem}</Button>
      </div>
    );
  }
  const object = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const properties = schema.properties ?? {};
  return (
    <div className={cx("ui-schema__object", classes?.object)}>
      {Object.entries(properties).map(([key, child]) => {
        const childId = `${controlId}-${encodeURIComponent(key)}`;
        return (
          <div className={cx("ui-schema__field", classes?.field)} key={key}>
            <label htmlFor={childId}>
              {child.title ?? key}
              {schema.required?.includes(key) ? <span className="ui-schema__required"> *</span> : null}
            </label>
            {child.description && firstType(child) !== "boolean" ? (
              <span className={classes?.muted}>{child.description}</span>
            ) : null}
            {renderSchemaNode({ ...props, schema: child, value: object[key], path: [...props.path, key], controlId: childId,
              onChange: (next) => onChange({ ...object, [key]: next }),
            })}
          </div>
        );
      })}
    </div>
  );
}

/** One rendering traversal owns both fallback controls and their active syntax
 * buffers. No second Schema interpreter or validation store is introduced. */
export function SchemaForm({ schema, value, onChange, onValidityChange, presentation = "form", labels, className, classes }: SchemaFormProps) {
  const controlId = `schema-${useId().replaceAll(":", "")}`;
  const [drafts, setDrafts] = useState<Drafts>({});
  const props: NodeProps = { schema, value, onChange, controlId, labels, classes, drafts, path: [],
    onDraft: (path, draft) => setDrafts((current) => {
      const next = { ...current };
      if (!draft.invalid) for (const key of Object.keys(next)) {
        const coordinate = JSON.parse(key) as FieldPath;
        if (coordinate.length > path.length && path.every((part, index) => coordinate[index] === part)) delete next[key];
      }
      next[JSON.stringify(path)] = draft;
      return next;
    }),
    onRemoveRow: (path, index) => setDrafts((current) => {
      const next: Record<string, JsonDraft> = {};
      for (const [key, draft] of Object.entries(current)) {
        const coordinate = JSON.parse(key) as (string | number)[];
        const member = coordinate[path.length];
        if (path.every((part, position) => coordinate[position] === part) && typeof member === "number") {
          if (member === index) continue;
          if (member > index) coordinate[path.length] = member - 1;
        }
        next[JSON.stringify(coordinate)] = draft;
      }
      return next;
    }),
  };
  const content = presentation === "source" ? renderJsonFallback(props) : renderSchemaNode(props);
  const valid = !Object.values(drafts).some((draft) => draft.invalid);
  const reported = useRef<{ valid: boolean; callback: SchemaFormProps["onValidityChange"] } | undefined>(undefined);
  useLayoutEffect(() => {
    if (reported.current?.valid === valid && reported.current.callback === onValidityChange) return;
    reported.current = { valid, callback: onValidityChange };
    onValidityChange?.(valid);
  }, [onValidityChange, valid]);
  return <div className={cx("ui-schema", classes?.root, className)}>{content}</div>;
}
