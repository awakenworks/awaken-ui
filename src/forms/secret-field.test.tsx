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
