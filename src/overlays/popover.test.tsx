import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { MenuPopover, Popover } from "./popover.js";

describe("Popover", () => {
  it("delegates dismissal and focus restoration to the headless primitive", async () => {
    render(
      <Popover aria-label="Actions" content={<button type="button">Run</button>}>
        <button type="button">Open</button>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Run" })).toHaveFocus(),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("supports wrapping menu navigation and closes after actions on request", () => {
    render(
      <MenuPopover
        aria-label="Actions"
        closeOnContentClick
        content={
          <>
            <button type="button">First</button>
            <button type="button">Second</button>
          </>
        }
      >
        <button type="button">Open</button>
      </MenuPopover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("supports product-controlled disclosure state", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover
        aria-label="Workspace"
        content={<button type="button">Select</button>}
        onOpenChange={onOpenChange}
        open={false}
      >
        <button type="button">Workspace</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Workspace" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Popover
        aria-label="Workspace"
        content={<button type="button">Select</button>}
        onOpenChange={onOpenChange}
        open
      >
        <button type="button">Workspace</button>
      </Popover>,
    );
    expect(screen.getByRole("dialog", { name: "Workspace" })).toBeInTheDocument();
  });

  it("requests and reflects controlled closure after a content action", () => {
    function ControlledPopover() {
      const [open, setOpen] = useState(true);
      return (
        <Popover
          aria-label="Workspace"
          closeOnContentClick
          content={<button type="button">Select</button>}
          onOpenChange={setOpen}
          open={open}
        >
          <button type="button">Workspace</button>
        </Popover>
      );
    }

    render(<ControlledPopover />);
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    expect(screen.queryByRole("dialog", { name: "Workspace" })).not.toBeInTheDocument();
  });
  it("keeps disabled and cancelled actions open and closes an enabled nested action", async () => {
    // Decision table: closeOnContentClick + R1 disabled/R2 prevented -> open;
    // R3 enabled nested target -> closed. Caller cancellation has precedence.
    render(<MenuPopover aria-label="Actions" closeOnContentClick content={<>
      <a role="menuitem" aria-disabled="true">Unavailable</a>
      <a href="#cancel" onClick={(event) => event.preventDefault()}>Cancelled</a>
      <a href="#done"><span>Continue</span></a>
    </>}><button type="button">Open</button></MenuPopover>);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Unavailable" }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
    fireEvent.click(screen.getByRole("link", { name: "Cancelled" }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

});
