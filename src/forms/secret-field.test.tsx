import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SecretField } from "./secret-field.js";

const labels = {
  keep: "Keep",
  replace: "Replace",
  clear: "Clear",
  placeholder: "Enter secret",
  kept: "Unchanged",
  cleared: "Will be removed",
};

describe("SecretField", () => {
  /**
   * Causes: stored presence, selected mode, entered replacement, explicit
   * placeholder, and independent field identity. Effects: password visibility,
   * accessible label, emitted write-only intent, and replacement draft retention.
   * R1 absent -> replace input, no mode controls, no mount mutation.
   * R2 stored -> keep, no secret input or mount mutation.
   * R3 replace + input -> exact replacement; R4 keep/clear -> intent without value.
   * R5 return to replace -> current typed draft; R6 two fields -> distinct labels.
   */
  it("preserves every keep/replace/clear transition without exposing stored material", () => {
    const change = vi.fn();
    render(<SecretField hasStored label="Token" labels={{ ...labels, modeLabel: "Update token" }} onChange={change} />);
    expect(change).not.toHaveBeenCalled(); // R2
    expect(screen.queryByLabelText("Token")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Update token" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(change).toHaveBeenLastCalledWith({ mode: "replace", value: "" });
    const input = screen.getByLabelText("Token");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.change(input, { target: { value: "replacement" } }); // R3
    for (const [name, mode] of [["Keep", "keep"], ["Clear", "clear"]] as const) {
      fireEvent.click(screen.getByRole("button", { name }));
      expect(change).toHaveBeenLastCalledWith({ mode }); // R4
      expect(screen.queryByDisplayValue("replacement")).not.toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(screen.getByLabelText("Token")).toHaveValue("replacement"); // R5
  });

  it("labels independent new secrets and emits nothing until an edit", () => {
    const change = vi.fn();
    render(<>
      <SecretField hasStored={false} label="First" labels={labels} onChange={change} placeholder="Custom prompt" />
      <SecretField hasStored={false} label="Second" labels={labels} onChange={change} />
    </>);
    expect(change).not.toHaveBeenCalled(); // R1
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.getByLabelText("First")).toHaveAttribute("placeholder", "Custom prompt");
    expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id); // R6
  });

  it("emits intent without receiving the stored value", () => {
    const onChange = vi.fn();
    render(<SecretField hasStored label="Token" labels={labels} onChange={onChange} />);
    expect(screen.getByText("Unchanged")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    fireEvent.change(screen.getByPlaceholderText("Enter secret"), {
      target: { value: "new-value" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      mode: "replace",
      value: "new-value",
    });
    expect(screen.queryByDisplayValue(/stored/i)).not.toBeInTheDocument();
  });
});
