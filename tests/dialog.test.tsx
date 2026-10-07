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
    const user = userEvent.setup();
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Open profile" });

    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Profile" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close profile" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Profile" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
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
