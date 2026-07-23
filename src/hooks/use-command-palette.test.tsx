import { act, renderHook } from "@testing-library/react";
import { useCommandPalette } from "./use-command-palette.js";

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
});
