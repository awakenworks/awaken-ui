import { useRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Dialog, Drawer } from "../src/index.js";

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        Open profile
      </button>
      <Dialog
        closeLabel="Close profile"
        onOpenChange={setOpen}
        open={open}
        title="Profile"
      >
        <button type="button">First action</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("returns to a dialog-selected field through the original focus owner", async () => {
    // DT-CLOSE R1 selection + closed disclosure -> engine-owned return to the
    // exact field after modal cleanup; R2 Escape without selection -> original
    // opener. No callback/timer competes with the engine's final focus.
    function Form() {
      const [open, setOpen] = useState(false);
      const restore = useRef<HTMLElement | null>(null);
      const destination = useRef<HTMLInputElement>(null);
      return <><button onClick={(event) => { restore.current = event.currentTarget; setOpen(true); }}>Find field</button>
        <details><summary>More settings</summary><input aria-label="Destination" ref={destination} /></details>
        <Dialog open={open} onOpenChange={setOpen} closeLabel="Close search" title="Fields" restoreFocusTo={restore}>
          <button onClick={() => { restore.current = destination.current; setOpen(false); }}>Choose field</button>
        </Dialog></>;
    }
    const user = userEvent.setup(); render(<Form />);
    const opener = screen.getByRole("button", { name: "Find field" });
    await user.click(opener);
    await user.click(screen.getByRole("button", { name: "Choose field" }));
    await waitFor(() => expect(screen.getByLabelText("Destination")).toHaveFocus());
    await user.click(opener); await user.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it.each(["save", "escape", "close"])("restores an explicit opener after an autofocused form unmounts through %s", async (action) => {
    // DT-FOCUS1 native autofocus + conditional mounted form x acknowledged
    // save/Escape/close -> engine-owned return to the exact connected opener.
    // No product focus timer/trap or domain action is added by the component.
    function Form() {
      const [open, setOpen] = useState(false);
      const opener = useRef<HTMLButtonElement>(null);
      return <><button ref={opener} onClick={() => setOpen(true)}>Edit profile</button>
        {open ? <Dialog open onOpenChange={setOpen} restoreFocusTo={opener} closeLabel="Close profile" title="Profile">
          <input aria-label="Name" autoFocus defaultValue="Original name" />
          <button onClick={() => setOpen(false)}>Save profile</button>
        </Dialog> : null}</>;
    }
    const user = userEvent.setup(); render(<Form />);
    const opener = screen.getByRole("button", { name: "Edit profile" });
    await user.click(opener); expect(screen.getByLabelText("Name")).toHaveFocus();
    if (action === "escape") await user.keyboard("{Escape}");
    else await user.click(screen.getByRole("button", { name: action === "save" ? "Save profile" : "Close profile" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it("moves focus into the modal, closes with Escape, and restores focus", async () => {
    // F1 native activation schedules the one headless focus owner; dialog
    // presence is not its completed focus receipt. F2 Escape schedules return
    // to the same opener. Await these effects without replacing their owner.
    const user = userEvent.setup();
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Open profile" });

    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Profile" })).toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: "Close profile" })).toHaveFocus());

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Profile" })).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("provides an accessible close control", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Open profile" }));

    await user.click(screen.getByRole("button", { name: "Close profile" }));

    expect(screen.queryByRole("dialog", { name: "Profile" })).not.toBeInTheDocument();
  });
});

describe("Drawer", () => {
  it("uses dialog semantics while preserving the requested side", () => {
    render(
      <Drawer
        closeLabel="Close details"
        onOpenChange={() => undefined}
        open
        side="start"
        title="Details"
      >
        Content
      </Drawer>,
    );

    expect(screen.getByRole("dialog", { name: "Details" })).toHaveAttribute(
      "data-side",
      "start",
    );
  });
});
