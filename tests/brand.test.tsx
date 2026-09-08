import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  brandMarkBody, brandMarkPalette, brandMarkSchemes, canonicalBrandMark,
  publicBrandMarks, renderAdaptiveFaviconSvg, renderBrandMarkSvg,
} from "../src/brand/marks.js";
import { BrandMark } from "../src/brand/react.js";
import { brandFaviconPlugin } from "../src/brand/vite.js";

describe("Awaken brand authority", () => {
  // Cause/effect table: C1 mark canonical/legacy/unknown; C2 surface light/dark/
  // current/unknown; C3 output React/download/favicon; C4 labelled/decorative.
  // R1 canonical + valid surface -> same A/O/W geometry, one direction point.
  // R2 legacy alias -> canonical geometry, no second identity.
  // R3 unknown mark or surface -> throw, never silently select another product.
  // R4 labelled -> named img; decorative -> hidden from assistive technology.
  // All valid mark/surface pairs are enumerated because palettes vary by both.
  it.each(publicBrandMarks)("renders one %s geometry across all outputs", (mark) => {
    const body = brandMarkBody(mark);
    expect(body.match(/data-role="decision"/g)).toHaveLength(1);
    expect(body).toContain(`data-silhouette="${{ works: "A", agents: "A", objects: "O", workforce: "W" }[mark]}"`);
    const { container } = render(<BrandMark mark={mark} />);
    const expected = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    expected.innerHTML = body;
    expect(container.querySelector("svg")?.innerHTML).toBe(expected.innerHTML);
    for (const scheme of [...brandMarkSchemes, "current"] as const) {
      const svg = renderBrandMarkSvg(mark, scheme);
      const palette = brandMarkPalette(mark, scheme);
      expect(svg).toContain(body.replaceAll("var(--mark-primary)", palette.primary)
        .replaceAll("var(--mark-decision)", palette.decision));
    }
    const favicon = renderAdaptiveFaviconSvg(mark);
    expect(favicon).toContain(body);
    for (const scheme of brandMarkSchemes) expect(favicon).toContain(brandMarkPalette(mark, scheme).primary);
    // R5 any hosting base + offline -> one inline favicon, no asset fetch or
    // duplicate tracked drawing; build and dev execute this same hook.
    const tags = brandFaviconPlugin(mark).transformIndexHtml();
    expect(tags).toHaveLength(1);
    expect(tags[0]?.attrs.rel).toBe("icon");
    expect(decodeURIComponent(tags[0]!.attrs.href.split(",")[1]!)).toBe(favicon);
  });

  it("retains the original shared A without duplicating its source", () => {
    expect(brandMarkBody("works")).toBe(brandMarkBody("agents"));
    const source = readFileSync(resolve("src/brand/marks.ts"), "utf8");
    expect(source.match(/const awakenA =/g)).toHaveLength(1);
    expect(source.match(/function decisionDot\(/g)).toHaveLength(1);
    for (const scheme of brandMarkSchemes) {
      expect(brandMarkPalette("works", scheme).primary).not.toBe(brandMarkPalette("agents", scheme).primary);
      expect(new Set(publicBrandMarks.map((mark) => brandMarkPalette(mark, scheme).decision)).size).toBe(1);
    }
  });

  it("normalizes route aliases and rejects unknown identities", () => {
    for (const [alias, mark] of [["harness", "agents"], ["platform", "agents"], ["flow", "workforce"]]) {
      expect(canonicalBrandMark(alias!)).toBe(mark);
      expect(brandMarkBody(alias!)).toBe(brandMarkBody(mark!));
    }
    expect(() => renderAdaptiveFaviconSvg("unknown")).toThrow("Unknown brand mark");
    expect(() => canonicalBrandMark("__proto__")).toThrow("Unknown brand mark");
    // JavaScript consumers also receive validation at this typed boundary.
    // @ts-expect-error deliberate unsupported scheme
    expect(() => brandMarkPalette("works", "unknown")).toThrow("Unknown brand mark scheme");
  });

  it("exposes a name only when supplied and keeps explicit palettes stable", () => {
    const { rerender } = render(<BrandMark mark="works" label="Awaken Cloud" scheme="on-dark" />);
    const mark = screen.getByRole("img", { name: "Awaken Cloud" });
    expect(mark).not.toHaveAttribute("aria-hidden");
    expect(mark.style.getPropertyValue("--mark-light-primary")).toBe(brandMarkPalette("works", "on-dark").primary);
    expect(mark.style.getPropertyValue("--mark-dark-primary")).toBe(brandMarkPalette("works", "on-dark").primary);
    rerender(<BrandMark mark="works" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });
});
