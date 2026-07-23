import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
