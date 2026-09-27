import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src/styles");
const aggregate = readFileSync(resolve(root, "components.css"), "utf8");
const core = readFileSync(resolve(root, "components-core.css"), "utf8");
const chat = readFileSync(resolve(root, "components-chat.css"), "utf8");
const forms = readFileSync(resolve(root, "components-forms-data.css"), "utf8");

function cssBlockDepth(source: string): { minimum: number; final: number } {
  const structural = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
  let depth = 0;
  let minimum = 0;
  for (const token of structural) {
    if (token === "{") depth += 1;
    else if (token === "}") depth -= 1;
    minimum = Math.min(minimum, depth);
  }
  return { minimum, final: depth };
}

describe("shared browser styling", () => {
  // Cause/effect: consumers import one stylesheet; every shared recipe must be
  // reachable once in cascade order, including icon layout before controls.
  it("keeps the public component stylesheet as the single ordered entry point", () => {
    expect(aggregate.trim().split(/\r?\n/)).toEqual([
      '@import "./icons.css";',
      '@import "./components-core.css";',
      '@import "./components-feedback-identity.css";',
      '@import "./components-chat.css";',
      '@import "./components-forms-data.css";',
      '@import "./components-layout-navigation.css";',
      '@import "./components-workbench.css";',
    ]);
  });

  it("stabilizes layout only for primary vertical scroll regions", () => {
    expect(core).toMatch(/\.ui-data-grid__scroll\s*\{[^}]*scrollbar-gutter:\s*stable/s);
    expect(core).toMatch(/\.ui-dialog__body\s*\{[^}]*scrollbar-gutter:\s*stable/s);
    expect(chat).toMatch(/\.ui-chat-list__viewport\s*\{[^}]*scrollbar-gutter:\s*stable/s);
    expect(`${core}\n${chat}\n${forms}`).not.toContain("scrollbar-width:");
    expect(`${core}\n${chat}\n${forms}`).not.toContain("::-webkit-scrollbar");
  });

  it("themes native fields without replacing their platform behavior", () => {
    expect(forms).toMatch(/\.ui-input::placeholder\s*\{[^}]*var\(--ui-color-text-muted\)/s);
    expect(forms).toMatch(/\.ui-input:disabled\s*\{[^}]*cursor:\s*not-allowed/s);
    expect(forms).toMatch(/\.ui-input:read-only:not\(:disabled\)\s*\{/);
    expect(forms).toMatch(/input\[type="checkbox"\][^{]*\{[^}]*accent-color:\s*var\(--ui-color-accent\)/s);
  });

  it("publishes syntactically balanced component styles", () => {
    // Cause/effect: an unmatched close brace is copied unchanged by the UI
    // build but rejected by every consumer PostCSS pipeline. Every published
    // component stylesheet must therefore stay non-negative and close at zero.
    for (const file of readdirSync(root).filter((name) => name.startsWith("components") && name.endsWith(".css"))) {
      expect(cssBlockDepth(readFileSync(resolve(root, file), "utf8")), file)
        .toEqual({ minimum: 0, final: 0 });
    }
  });
});

// Cause/effect: any component token without a contract declaration computes to
// an invalid value in a consumer with only contract.css. Exhaustive reference
// coverage is the smallest sufficient design (no interacting runtime states).
it("declares every shared recipe token or documents its local fallback", () => {
  const contract = readFileSync(resolve(root, "contract.css"), "utf8");
  const defined = new Set([...contract.matchAll(/(--ui-[\w-]+)\s*:/g)].map((match) => match[1]));
  const sources = readdirSync(root).filter((file) => file.startsWith("components") && file.endsWith(".css"));
  const missing = sources.flatMap((file) => [...readFileSync(resolve(root, file), "utf8").matchAll(/var\((--ui-[\w-]+)\s*\)/g)]
    .map((match) => match[1]).filter((name) => !defined.has(name)));
  expect([...new Set(missing)]).toEqual([]);
});
