import { act, renderHook } from "@testing-library/react";
import {
  useCommandPalette,
  useCommandPaletteShortcut,
} from "./use-command-palette.js";

const items = ["Agents", "Settings"];
const filterItems = (values: readonly string[], query: string) =>
  values.filter((value) => value.toLowerCase().includes(query.toLowerCase()));

describe("useCommandPalette", () => {
  it("owns filtering, roving selection, activation, and dismissal", () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useCommandPalette({
        filterItems,
        items,
        onOpenChange,
        onSelect,
        open: true,
      }),
    );

    act(() => result.current.onInputKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as never));
    expect(result.current.activeItem).toBe("Settings");
    act(() => result.current.onInputKeyDown({ key: "Enter", preventDefault: vi.fn() } as never));
    expect(onSelect).toHaveBeenCalledWith("Settings");
    act(() => result.current.onInputKeyDown({ key: "Escape", preventDefault: vi.fn() } as never));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    act(() => result.current.setQuery("agent"));
    expect(result.current.filteredItems).toEqual(["Agents"]);
    expect(result.current.selectedIndex).toBe(0);
  });

  it("owns the global Command/Ctrl+K and product open-event contract", () => {
    const onOpenChange = vi.fn();
    renderHook(() =>
      useCommandPaletteShortcut({
        onOpenChange,
        open: false,
        openEventName: "product:open-palette",
      }),
    );

    const shortcut = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "k",
    });
    act(() => window.dispatchEvent(shortcut));
    expect(shortcut.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => window.dispatchEvent(new Event("product:open-palette")));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });
});
