import { useState } from "react";
import { render, screen } from "@testing-library/react";
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
