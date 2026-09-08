import { X } from "../icons/index.js";
import { useId, useState } from "react";
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
  return ["object", "string", "number", "integer", "boolean", "array"].includes(
    firstType(schema) ?? "",
  );
}

type NodeProps = {
  readonly schema: JsonSchema;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  readonly controlId: string | undefined;
  readonly labels: SchemaFormLabels;
  readonly classes: SchemaFormClasses | undefined;
};

function JsonFallback({ value, onChange, controlId, labels, classes }: NodeProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const text = draft ?? JSON.stringify(value ?? null, null, 2);
  return (
    <div>
      <textarea
        id={controlId}
        className={cx("ui-input", "ui-schema__input", classes?.input, classes?.mono)}
        rows={4}
        value={text}
        onChange={(event) => {
          setDraft(event.target.value);
          try {
            onChange(event.target.value.trim() === "" ? null : JSON.parse(event.target.value));
            setError("");
          } catch {
            setError(labels.invalidJson);
          }
        }}
      />
      {error ? <span className={cx("ui-schema__error", classes?.error)}>{error}</span> : null}
    </div>
  );
}

function SchemaNode(props: NodeProps) {
  const { schema, value, onChange, controlId, labels, classes } = props;
  if (!isStructurallyRenderable(schema)) return <JsonFallback {...props} />;
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
              <SchemaNode {...props} schema={items} value={item}
                controlId={controlId ? `${controlId}-${index}` : undefined}
                onChange={(next) => onChange(array.map((current, currentIndex) =>
                  currentIndex === index ? next : current))} />
            </div>
            <Button aria-label={labels.removeItem} className={classes?.button} type="button"
              onClick={() => onChange(array.filter((_, currentIndex) => currentIndex !== index))}><X /></Button>
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
        const childId = controlId ? `${controlId}-${key}` : undefined;
        return (
          <div className={cx("ui-schema__field", classes?.field)} key={key}>
            <label htmlFor={childId}>
              {child.title ?? key}
              {schema.required?.includes(key) ? <span className="ui-schema__required"> *</span> : null}
            </label>
            {child.description && firstType(child) !== "boolean" ? (
              <span className={classes?.muted}>{child.description}</span>
            ) : null}
            <SchemaNode {...props} schema={child} value={object[key]} controlId={childId}
              onChange={(next) => onChange({ ...object, [key]: next })} />
          </div>
        );
      })}
    </div>
  );
}

export function SchemaForm({
  schema,
  value,
  onChange,
  labels,
  className,
  classes,
}: SchemaFormProps) {
  const controlId = `schema-${useId().replaceAll(":", "")}`;
  return (
    <div className={cx("ui-schema", classes?.root, className)}>
      <SchemaNode schema={schema} value={value} onChange={onChange}
        controlId={controlId} labels={labels} classes={classes} />
    </div>
  );
}
