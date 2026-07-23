import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
});
