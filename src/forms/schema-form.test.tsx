import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Activity, useState } from "react";
import { SchemaForm, stringControlForSchema } from "./schema-form.js";

const labels = {
  addItem: "Add item",
  invalidJson: "Invalid JSON",
  removeItem: "Remove item",
};

describe("SchemaForm", () => {
  it("chooses multiline string controls from schema format", () => {
    expect(stringControlForSchema({ type: ["string", "null"], format: "textarea" }))
      .toBe("textarea");
  });

  it("emits immutable object updates", () => {
    const value = { name: "before" };
    const onChange = vi.fn();
    render(
      <SchemaForm
        labels={labels}
        onChange={onChange}
        schema={{ type: "object", properties: { name: { type: "string" } } }}
        value={value}
      />,
    );
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "after" } });
    expect(onChange).toHaveBeenCalledWith({ name: "after" });
    expect(value).toEqual({ name: "before" });
  });

  it("keeps invalid fallback JSON as a draft", () => {
    render(
      <SchemaForm
        labels={labels}
        onChange={vi.fn()}
        schema={{ oneOf: [] }}
        value={{ ok: true }}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "{" } });
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
  });
});


it("aggregates independent invalid buffers and retains them while the pane is hidden", () => {
  // DT-SF-VALIDITY: C1 first/second fallback invalid; C2 only one repaired;
  // C3 hidden mounted pane; C4 both repaired. R1 any invalid -> false and
  // original owner value retained; R2 hiding -> same text/status; R3 all fixed
  // -> true. Independent fields cannot clear one another's error.
  const observe = vi.fn();
  function Harness() {
    const [value, setValue] = useState({ first: { ok: 1 }, second: { ok: 2 } });
    const [visible, setVisible] = useState(true);
    const [valid, setValid] = useState(true);
    return <><button onClick={() => setVisible((current) => !current)}>Toggle pane</button>
      <button disabled={!valid}>Submit</button><output>{JSON.stringify(value)}</output>
      <Activity mode={visible ? "visible" : "hidden"}><SchemaForm labels={labels} value={value} onChange={(next) => setValue(next as typeof value)}
        onValidityChange={(next) => { observe(next); setValid(next); }}
        schema={{ type: "object", properties: { first: { anyOf: [] }, second: { anyOf: [] } } }} /></Activity></>;
  }
  render(<Harness />);
  fireEvent.change(screen.getByLabelText("first"), { target: { value: "{" } });
  fireEvent.change(screen.getByLabelText("second"), { target: { value: "[" } });
  expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  expect(screen.getByRole("status")).toHaveTextContent('{"first":{"ok":1},"second":{"ok":2}}');
  fireEvent.change(screen.getByLabelText("first"), { target: { value: '{"fixed":1}' } });
  expect(observe).toHaveBeenLastCalledWith(false);
  fireEvent.click(screen.getByRole("button", { name: "Toggle pane" }));
  expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Toggle pane" }));
  expect(screen.getByLabelText("second")).toHaveValue("[");
  fireEvent.change(screen.getByLabelText("second"), { target: { value: '{"fixed":2}' } });
  expect(observe).toHaveBeenLastCalledWith(true);
  expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
});

it("keeps remaining array drafts aligned when an earlier row is explicitly removed", () => {
  // DT-SF-ROWS: two invalid row buffers + remove earlier row -> drop only its
  // buffer and shift the later buffer with its original row. Repair later row
  // -> update that row and unblock. Removed rows cannot leave a stale refusal.
  const observe = vi.fn();
  function Harness() {
    const [value, setValue] = useState([{ id: "first" }, { id: "second" }, { id: "third" }]);
    return <><output>{JSON.stringify(value)}</output><SchemaForm labels={labels} value={value} onChange={(next) => setValue(next as typeof value)}
      onValidityChange={observe} schema={{ type: "array", items: { anyOf: [] } }} /></>;
  }
  render(<Harness />);
  fireEvent.change(screen.getAllByRole("textbox")[0]!, { target: { value: "{" } });
  fireEvent.change(screen.getAllByRole("textbox")[2]!, { target: { value: "[" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Remove item" })[0]!);
  expect(screen.getAllByRole("textbox")).toHaveLength(2);
  expect(screen.getAllByRole("textbox")[0]).toHaveValue(JSON.stringify({ id: "second" }, null, 2));
  expect(screen.getAllByRole("textbox")[1]).toHaveValue("[");
  expect(observe).toHaveBeenLastCalledWith(false);
  fireEvent.change(screen.getAllByRole("textbox")[1]!, { target: { value: '{"id":"third","fixed":true}' } });
  expect(screen.getByRole("status")).toHaveTextContent('[{"id":"second"},{"id":"third","fixed":true}]');
  expect(observe).toHaveBeenLastCalledWith(true);
});

it("refreshes a valid source view from owner edits and keeps an invalid source with current error copy", () => {
  // DT-SF-SYNC: valid buffer + different owner value -> display owner value;
  // invalid buffer + owner/label update -> retain text and use current copy;
  // valid JSON -> onChange reports it, never classifies owner exceptions as
  // parse failures. Syntax status is independent of domain admission.
  const onChange = vi.fn(); const observe = vi.fn(); const schema = { anyOf: [] };
  const { rerender } = render(<SchemaForm labels={labels} schema={schema} value={{ version: 1 }} onChange={onChange} onValidityChange={observe} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: '{"version": 2}' } });
  rerender(<SchemaForm labels={labels} schema={schema} value={{ version: 3 }} onChange={onChange} onValidityChange={observe} />);
  expect(screen.getByRole("textbox")).toHaveValue(JSON.stringify({ version: 3 }, null, 2));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "{" } });
  rerender(<SchemaForm labels={{ ...labels, invalidJson: "Repair this input" }} schema={schema} value={{ version: 4 }} onChange={onChange} onValidityChange={observe} />);
  expect(screen.getByRole("textbox")).toHaveValue("{");
  expect(screen.getByRole("alert")).toHaveTextContent("Repair this input");
  expect(observe).toHaveBeenLastCalledWith(false);
});


it("uses one buffer owner across form/source presentation and an explicit whole-value repair", () => {
  // DT-SF-SOURCE: invalid nested buffer + switch to source -> still invalid;
  // whole-value source repair -> replaces that value and its nested buffers;
  // return to form -> repaired value, without remounting or a second parser.
  const onChange = vi.fn(); const observe = vi.fn();
  const schema = { type: "object", title: "Complete object", properties: { payload: { anyOf: [] } } };
  const { rerender } = render(<SchemaForm labels={labels} schema={schema} value={{ payload: { ok: 1 } }} onChange={onChange} onValidityChange={observe} />);
  fireEvent.change(screen.getByLabelText("payload"), { target: { value: "{" } });
  rerender(<SchemaForm labels={labels} schema={schema} presentation="source" value={{ payload: { ok: 1 } }} onChange={onChange} onValidityChange={observe} />);
  expect(observe).toHaveBeenLastCalledWith(false);
  fireEvent.change(screen.getByLabelText("Complete object"), { target: { value: '{"payload":{"ok":2}}' } });
  expect(onChange).toHaveBeenLastCalledWith({ payload: { ok: 2 } });
  expect(observe).toHaveBeenLastCalledWith(true);
  rerender(<SchemaForm labels={labels} schema={schema} value={{ payload: { ok: 2 } }} onChange={onChange} onValidityChange={observe} />);
  expect(screen.getByLabelText("payload")).toHaveValue(JSON.stringify({ ok: 2 }, null, 2));
});

it("keeps wrong basic source types local and permits an explicitly nullable dictionary", () => {
  // DT-SF-TYPE: valid syntax + wrong declared root type -> retained text,
  // current type diagnostic, false status and zero owner changes; repair ->
  // normal value/status. Nullable dictionaries admit an explicit blank/null.
  const onChange = vi.fn(); const observe = vi.fn();
  const { rerender } = render(<SchemaForm labels={{ ...labels, invalidType: "Object required" }}
    schema={{ type: "object", title: "Dictionary" }} value={{ ok: true }} onChange={onChange} onValidityChange={observe} />);
  fireEvent.change(screen.getByLabelText("Dictionary"), { target: { value: "[]" } });
  expect(screen.getByLabelText("Dictionary")).toHaveValue("[]");
  expect(screen.getByRole("alert")).toHaveTextContent("Object required");
  expect(onChange).not.toHaveBeenCalled(); expect(observe).toHaveBeenLastCalledWith(false);
  fireEvent.change(screen.getByLabelText("Dictionary"), { target: { value: '{"ok":false}' } });
  expect(onChange).toHaveBeenLastCalledWith({ ok: false }); expect(observe).toHaveBeenLastCalledWith(true);
  rerender(<SchemaForm labels={labels} schema={{ type: ["object", "null"], title: "Dictionary" }} value={{ ok: false }} onChange={onChange} onValidityChange={observe} />);
  fireEvent.change(screen.getByLabelText("Dictionary"), { target: { value: "" } });
  expect(onChange).toHaveBeenLastCalledWith(null); expect(observe).toHaveBeenLastCalledWith(true);
});


it("does not misreport a caller rejection as invalid JSON", () => {
  // DT-SF-OWNER: parse succeeds but the caller throws -> propagate that owner
  // failure, with no fabricated syntax diagnostic. Parsing failure is covered
  // separately and never invokes the caller.
  const failure = new Error("owner refused the change");
  const observed: unknown[] = [];
  const capture = (event: ErrorEvent) => { observed.push(event.error); event.preventDefault(); };
  window.addEventListener("error", capture);
  try {
    render(<SchemaForm labels={labels} schema={{ anyOf: [] }} value={{ ok: true }} onChange={() => { throw failure; }} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "{}" } });
    expect(observed).toContain(failure);
    expect(screen.queryByText("Invalid JSON")).not.toBeInTheDocument();
  } finally { window.removeEventListener("error", capture); }
});
