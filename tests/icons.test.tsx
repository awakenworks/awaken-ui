import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as icons from "../src/icons/index.js";
import * as data from "../src/icons/data.js";

// Decision table: each admitted geometry x decorative/named use, caller sizing,
// and native ref/event composition. React and Astro receive the same upstream
// nodes/attributes; no renderer may redraw paths, invent text, or make an unnamed
// icon part of a control's accessible name. Geometry enumeration catches missing
// exports and path/attribute loss for circles, lines, polygons and complex paths.
describe("one functional icon source", () => {
  it.each(Object.entries(icons))("renders the admitted %s geometry unchanged", (name, Icon) => {
    const geometry = data[name as keyof typeof icons];
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", data.iconAttributes.viewBox);
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
    expect(svg).toHaveAttribute("stroke-width", "2");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg.children).toHaveLength(geometry[2]?.length ?? 0);
    geometry[2]?.forEach(([tag, attributes], index) => {
      const child = svg.children[index]!;
      expect(child.tagName).toBe(tag);
      for (const [key, value] of Object.entries(attributes)) expect(child.getAttribute(key)).toBe(String(value));
    });
  });

  it("names only explicit standalone images and composes native props", () => {
    const ref = createRef<SVGSVGElement>();
    const click = vi.fn();
    const { rerender } = render(<icons.Search label="Search symbol" size={24} ref={ref} onClick={click} className="consumer-icon" />);
    const svg = screen.getByRole("img", { name: "Search symbol" });
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveClass("ui-icon", "consumer-icon");
    expect(svg).not.toHaveAttribute("aria-hidden");
    fireEvent.click(svg);
    expect(click).toHaveBeenCalledOnce();
    rerender(<button aria-label="Search"><icons.Search /></button>);
    expect(screen.getByRole("button", { name: "Search" })).toBeVisible();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
