import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./tabs.js";

function Example({ activationMode = "automatic" }: { readonly activationMode?: "automatic" | "manual" }) {
  const [value, setValue] = useState("overview");
  return <Tabs value={value} onValueChange={setValue} activationMode={activationMode}>
    <TabList aria-label="Editor sections">
      <Tab value="overview">Overview</Tab>
      <Tab value="tools">Tools</Tab>
      <Tab value="disabled" disabled>Disabled</Tab>
    </TabList>
    <TabPanel value="overview">Overview panel</TabPanel>
    <TabPanel value="tools">Tools panel</TabPanel>
  </Tabs>;
}

describe("Tabs", () => {
  it("links tabs to panels and activates with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    await user.click(overview);
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Tools" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Tools panel");
    expect(overview).toHaveAttribute("aria-controls");
  });

  it("moves focus without selecting in manual mode", async () => {
    const user = userEvent.setup();
    render(<Example activationMode="manual" />);
    await user.click(screen.getByRole("tab", { name: "Overview" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Tools" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: "Tools" })).toHaveAttribute("aria-selected", "true");
  });

  it("supports Home, End and wrapping while skipping disabled tabs", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    await user.click(overview);
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Tools" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(overview).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Tools" })).toHaveFocus();
  });

  it("uses vertical arrow keys only for vertical tabs", () => {
    const onValueChange = vi.fn();
    render(<Tabs value="one" onValueChange={onValueChange} orientation="vertical">
      <TabList aria-label="Vertical"><Tab value="one">One</Tab><Tab value="two">Two</Tab></TabList>
      <TabPanel value="one">One panel</TabPanel><TabPanel value="two">Two panel</TabPanel>
    </Tabs>);
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("preserves a caller keyboard cancellation", () => {
    const onValueChange = vi.fn();
    render(<Tabs value="one" onValueChange={onValueChange}>
      <TabList aria-label="Cancelled"><Tab value="one" onKeyDown={(event) => event.preventDefault()}>One</Tab><Tab value="two">Two</Tab></TabList>
      <TabPanel value="one">One panel</TabPanel><TabPanel value="two">Two panel</TabPanel>
    </Tabs>);
    fireEvent.keyDown(screen.getByRole("tab", { name: "One" }), { key: "ArrowRight" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps an enabled fallback in the tab order when value is invalid or disabled", () => {
    const { rerender } = render(<Tabs value="missing" onValueChange={() => undefined}>
      <TabList aria-label="Fallback"><Tab value="one">One</Tab><Tab value="two">Two</Tab></TabList>
    </Tabs>);
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("tabindex", "0");
    rerender(<Tabs value="one" onValueChange={() => undefined}>
      <TabList aria-label="Fallback"><Tab value="one" disabled>One</Tab><Tab value="two">Two</Tab></TabList>
    </Tabs>);
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("tabindex", "0");
  });

  it("keeps ids unique across tab groups", () => {
    render(<><Example /><Example /></>);
    const tabs = screen.getAllByRole("tab", { name: "Overview" });
    expect(tabs[0]?.id).not.toBe(tabs[1]?.id);
  });
});
