import { fireEvent, render, screen } from "@testing-library/react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  SectionHeader,
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
    render(<Switch checked={false} onCheckedChange={change} label="Enabled" />);
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

  it("keeps section structure and empty-state actions accessible", () => {
    const action = vi.fn();
    render(
      <>
        <SectionHeader title="Agents" count={3} actions={<button>New</button>} />
        <EmptyState title="No agents" body="Create one" action={{ label: "Create", onClick: action }} />
      </>,
    );
    expect(screen.getByRole("heading", { name: /Agents\s*3/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(action).toHaveBeenCalledOnce();
  });
});
