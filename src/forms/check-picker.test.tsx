import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckPicker } from "./check-picker.js";

describe("CheckPicker", () => {
  it("emits the next controlled selection without mutating input", () => {
    const selected = ["read"];
    const onChange = vi.fn();
    render(
      <CheckPicker
        onChange={onChange}
        options={[
          { id: "read", label: "Read" },
          { id: "write", label: "Write", description: "Can modify data" },
        ]}
        selected={selected}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /Write/ }));
    expect(onChange).toHaveBeenCalledWith(["read", "write"]);
    expect(selected).toEqual(["read"]);
  });
});
