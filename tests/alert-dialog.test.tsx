import { useState } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AlertDialog } from "../src/index.js";

function AlertHarness({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <AlertDialog
      cancelLabel="Keep item"
      confirmLabel="Delete item"
      danger
      impacts={[
        {
          id: "history",
          content: "History remains available",
          tone: "safe",
        },
      ]}
      onConfirm={() => {
        onConfirm();
        setOpen(false);
      }}
      onOpenChange={setOpen}
      open={open}
      title="Delete item?"
    />
  );
}

describe("AlertDialog", () => {
  it("initially focuses the safe action and confirms once", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<AlertHarness onConfirm={onConfirm} />);

    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Keep item" })).toHaveFocus(),
    );
    await user.click(screen.getByRole("button", { name: "Delete item" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
