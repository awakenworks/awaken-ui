import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorForm } from "./editor-form.js";

describe("EditorForm", () => {
  it("owns error and pending action semantics", () => {
    const onCancel = vi.fn();
    render(
      <EditorForm
        cancelLabel="Cancel"
        error="Request failed"
        errorPrefix="Save:"
        onCancel={onCancel}
        onSubmit={vi.fn()}
        pending
        submitLabel="Save"
      >
        <input aria-label="Name" />
      </EditorForm>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Save: Request failed");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
