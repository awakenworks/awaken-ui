import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SuiteSwitcher } from "./suite-switcher.js";

describe("SuiteSwitcher", () => {
  it("renders one current product and consumer-authorized product and Cloud destinations", async () => {
    // Causal contract: caller projection -> exact menu rows; a current product
    // has no navigation authority, while every supplied target keeps its exact
    // server-owned href. Omitted destinations cannot appear by inference.
    render(<SuiteSwitcher
      aria-label="Awaken products"
      currentLabel="Current product and Workspace"
      destinations={[
        { id: "all", label: "All products", href: "https://cloud.test/products" },
        { id: "usage", label: "Usage & Billing", href: "https://cloud.test/usage-billing" },
      ]}
      products={[
        { id: "agents", label: "Awaken Agents", description: "Agent Workspace", isCurrent: true },
        { id: "flow", label: "Awaken Flow", description: "Product Delivery", href: "https://cloud.test/entry?product=flow" },
      ]}
      trigger={<button type="button">Awaken Agents</button>}
    />);
    fireEvent.click(screen.getByRole("button", { name: "Awaken Agents" }));
    await waitFor(() => expect(screen.getByText("Current product and Workspace")).toBeVisible());
    const current = screen.getByRole("menuitem", { name: /Awaken Agents/ });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("aria-disabled", "true");
    expect(current).not.toHaveAttribute("href");
    expect(screen.getByRole("menuitem", { name: /Awaken Flow/ })).toHaveAttribute("href", "https://cloud.test/entry?product=flow");
    expect(screen.getByRole("menuitem", { name: "Usage & Billing" })).toHaveAttribute("href", "https://cloud.test/usage-billing");
    expect(screen.queryByText("Cloud settings")).not.toBeInTheDocument();
  });

  it("inherits keyboard navigation and closes after selecting a destination", async () => {
    render(<SuiteSwitcher
      aria-label="Products"
      currentLabel="Current"
      destinations={[{ id: "settings", label: "Cloud settings", href: "/settings" }]}
      products={[
        { id: "flow", label: "Flow", isCurrent: true },
        { id: "agents", label: "Agents", href: "/entry?product=awaken" },
      ]}
      trigger={<button type="button">Flow</button>}
    />);
    fireEvent.click(screen.getByRole("button", { name: "Flow" }));
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "End" });
    expect(screen.getByRole("menuitem", { name: "Cloud settings" })).toHaveFocus();
    fireEvent.click(screen.getByRole("menuitem", { name: "Cloud settings" }));
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });
});
