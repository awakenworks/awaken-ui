import { fireEvent, render, screen } from "@testing-library/react";
import { JsonInspector } from "./json-inspector.js";
import { userEvent } from "@testing-library/user-event";

describe("JsonInspector", () => {
  it("keeps translated copy labels as accessible names, never square-button icon content", async () => {
    // DT-JSON-COPY: R1 idle + long/RTL labels -> existing Copy glyph and named
    // button, no text forced into its square icon layout; no copy on render.
    // R2 explicit keyboard activation -> one exact source copy + Check glyph
    // and translated success name; disclosure stays unchanged. R3 locale
    // input changes -> same copied state/disclosure, no additional clipboard IO.
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText");
    const value = { original: "保持原始内容" };
    const view = render(<JsonInspector value={value} collapsed labels={{ copy: "Copy complete source JSON", copied: "Complete source JSON copied" }} />);
    const button = screen.getByRole("button", { name: "Copy complete source JSON" });
    expect(button.textContent).toBe(""); expect(button.querySelector("svg")).not.toBeNull();
    expect(copy).not.toHaveBeenCalled();
    button.focus(); await user.keyboard("{Enter}");
    const copied = await screen.findByRole("button", { name: "Complete source JSON copied" });
    expect(copied.textContent).toBe(""); expect(copied.querySelector("svg")).not.toBeNull();
    expect(copy).toHaveBeenCalledExactlyOnceWith(JSON.stringify(value, null, 2));
    view.rerender(<JsonInspector value={value} collapsed labels={{ copy: "نسخ المصدر كاملًا", copied: "تم نسخ المصدر كاملًا" }} />);
    expect(screen.getByRole("button", { name: "تم نسخ المصدر كاملًا" }).textContent).toBe("");
    expect(screen.getByRole("button", { name: "JSON" })).toHaveAttribute("aria-expanded", "false");
    expect(copy).toHaveBeenCalledTimes(1);
  });

  it("owns disclosure state while exposing localized actions", () => {
    render(
      <JsonInspector
        collapsed
        labels={{ copy: "复制", copied: "已复制" }}
        value={{ ok: true }}
      />,
    );

    expect(screen.queryByText(/"ok"/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "JSON" }));
    expect(screen.getByText(/"ok"/)).toBeVisible();
    expect(screen.getByRole("button", { name: "复制" })).toBeVisible();
  });
});
