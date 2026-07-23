import { fireEvent, render, screen } from "@testing-library/react";
import {
  Card,
  CardBody,
  CardHeader,
  SegmentedControl,
  Switch,
  TextField,
} from "../src/index.js";

describe("forms and surfaces", () => {
  it("wires field help and errors to the native control", () => {
    render(<TextField label="Name" help="Public name" error="Required" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain("-help");
    expect(describedBy).toContain("-error");
  });

  it("exposes switch state and delegates changes", () => {
    const change = vi.fn();
    render(<Switch checked={false} onChange={change} label="Enabled" />);
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    expect(change).toHaveBeenCalledWith(true);
  });

  it("supports roving tab selection by arrow key", () => {
    const change = vi.fn();
    render(
      <SegmentedControl
        role="tablist"
        buttonRole="tab"
        selectionAria="selected"
        ariaLabel="View"
        value="one"
        onChange={change}
        options={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
        ]}
      />,
    );
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(change).toHaveBeenCalledWith("two");
  });

  it("composes one canonical card skeleton", () => {
    render(<Card><CardHeader>Header</CardHeader><CardBody>Body</CardBody></Card>);
    expect(screen.getByText("Header").closest(".ui-card")).toBe(screen.getByText("Body").closest(".ui-card"));
  });
});
