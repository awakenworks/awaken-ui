import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DialogSurface } from "./dialog-surface.js";

describe("DialogSurface", () => {
  it("owns modal dismissal while preserving product classes and markup", () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open editor</button>
          <DialogSurface
            labelledBy="editor-title"
            onOpenChange={setOpen}
            open={open}
            overlayClassName="product-overlay"
            panelAs="section"
            panelClassName="product-panel"
            rootClassName="product-root"
          >
            <h2 id="editor-title">Editor</h2>
            <button type="button">Save</button>
          </DialogSurface>
        </>
      );
    }

    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open editor" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Editor" })).toHaveClass("product-panel");
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
