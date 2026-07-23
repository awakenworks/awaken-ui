import { render, screen } from "@testing-library/react";
import { Button } from "../src/index.js";

describe("Button", () => {
  it("uses native button semantics and defaults to a non-submit button", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("announces loading state and prevents duplicate activation", () => {
    render(
      <Button loading loadingLabel="Saving">
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

