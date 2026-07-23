import { fireEvent, render, screen } from "@testing-library/react";
import { JsonInspector } from "./json-inspector.js";

describe("JsonInspector", () => {
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
