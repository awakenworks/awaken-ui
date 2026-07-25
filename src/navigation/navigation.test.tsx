import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BreadcrumbItem, Breadcrumbs } from "./breadcrumbs.js";
import { TabNav, TabNavItem } from "./tab-nav.js";

describe("navigation primitives", () => {
  it("marks the current addressable tab", () => {
    render(<TabNav label="Thread sections"><TabNavItem href="/activity" current>Activity</TabNavItem></TabNav>);
    expect(screen.getByRole("link", { name: "Activity" })).toHaveAttribute("aria-current", "page");
  });

  it("uses breadcrumb navigation semantics", () => {
    render(<Breadcrumbs label="Location"><BreadcrumbItem href="/org">Org</BreadcrumbItem><BreadcrumbItem current title="Current project" data-scope="project">Project</BreadcrumbItem></Breadcrumbs>);
    expect(screen.getByRole("navigation", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByText("Project")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Project")).toHaveAttribute("title", "Current project");
    expect(screen.getByText("Project")).toHaveAttribute("data-scope", "project");
  });

  it("composes classes and events with a product link adapter", () => {
    const navigate = vi.fn();
    render(<TabNav label="Pages"><TabNavItem current render={<a href="/runs" className="product-link" onClick={(event) => { event.preventDefault(); navigate(); }} />}>Runs</TabNavItem></TabNav>);
    const link = screen.getByRole("link", { name: "Runs" });
    expect(link).toHaveClass("ui-tab-nav__link", "product-link");
    link.click();
    expect(navigate).toHaveBeenCalledOnce();
  });
});
