import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { DialogSurface } from "./dialog-surface.js";

describe("DialogSurface", () => {
  it("contains keyboard focus and does not restore it when an outside close is refused", async () => {
    // DT-SURFACE2 native forward/reverse Tab -> same modal containment owner;
    // outside dismissal refused -> modal/focus retained; explicit accepted
    // Escape -> return to opener. No duplicate forced restoration callback.
    let allowsClose = false;
    function Example() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Open surface</button>
        <DialogSurface open={open} onOpenChange={(next) => { if (!next && !allowsClose) return false; setOpen(next); }}
          ariaLabel="Keyboard surface" panelClassName="product-panel" overlayClassName="product-overlay">
          <button>First action</button><button disabled>Unavailable</button><button>Last action</button>
        </DialogSurface></>;
    }
    const user = userEvent.setup(); render(<Example />);
    const opener = screen.getByRole("button", { name: "Open surface" }); await user.click(opener);
    const first = screen.getByRole("button", { name: "First action" }); const last = screen.getByRole("button", { name: "Last action" });
    await waitFor(() => expect(first).toHaveFocus());
    await user.tab({ shift: true }); await waitFor(() => expect(last).toHaveFocus());
    await user.tab(); await waitFor(() => expect(first).toHaveFocus());
    await user.click(document.querySelector<HTMLElement>(".product-overlay")!);
    expect(screen.getByRole("dialog")).toBeVisible(); expect(opener).not.toHaveFocus();
    await user.keyboard("{Escape}"); expect(screen.getByRole("dialog")).toBeVisible();
    allowsClose = true; await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it("owns modal dismissal while preserving product classes and markup", async () => {
    // DT-SURFACE focus entry/Escape/return all delegate to the same headless
    // modal owner; no document-level parallel Tab trap or forced close focus.
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
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toHaveFocus());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
