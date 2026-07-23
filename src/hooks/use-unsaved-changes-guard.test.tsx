import { act, renderHook } from "@testing-library/react";
import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard.js";

describe("useUnsavedChangesGuard", () => {
  it("owns beforeunload registration and confirms guarded actions", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const action = vi.fn();
    const { result, unmount } = renderHook(() =>
      useUnsavedChangesGuard(true, "Discard?"),
    );

    expect(add).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    act(() => expect(result.current(action)).toBe(false));
    expect(action).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    act(() => expect(result.current(action)).toBe(true));
    expect(action).toHaveBeenCalledOnce();

    unmount();
    expect(remove).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });
});
