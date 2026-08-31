import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  SectionHeader,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Switch,
  SelectField,
  TextAreaField,
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

  it("forwards field refs to the stable native controls", () => {
    const input = createRef<HTMLInputElement>();
    const area = createRef<HTMLTextAreaElement>();
    const select = createRef<HTMLSelectElement>();
    render(<>
      <TextField aria-label="Input" ref={input} />
      <TextAreaField aria-label="Area" ref={area} />
      <SelectField aria-label="Select" ref={select}><option>One</option></SelectField>
    </>);

    expect(input.current).toBe(screen.getByRole("textbox", { name: "Input" }));
    expect(area.current).toBe(screen.getByRole("textbox", { name: "Area" }));
    expect(select.current).toBe(screen.getByRole("combobox", { name: "Select" }));
    input.current?.focus();
    expect(input.current).toHaveFocus();
  });

  it("exposes switch state and delegates changes", () => {
    const change = vi.fn();
    render(<Switch checked={false} onCheckedChange={change} label="Enabled" />);
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    expect(change).toHaveBeenCalledWith(true);
  });

  it("uses Tabs as the canonical roving tab implementation", () => {
    const change = vi.fn();
    render(
      <Tabs value="one" onValueChange={change}>
        <TabList aria-label="View"><Tab value="one">One</Tab><Tab value="two">Two</Tab></TabList>
        <TabPanel value="one">First</TabPanel><TabPanel value="two">Second</TabPanel>
      </Tabs>,
    );
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
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
