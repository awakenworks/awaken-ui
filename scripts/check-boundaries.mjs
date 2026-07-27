import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// URL.pathname is `/C:/...` on Windows; converting it as a filesystem path
// first avoids `resolve` incorrectly producing `C:\C:\...`.
const root = fileURLToPath(new URL("../src/", import.meta.url));
const forbiddenImports = [
  "@tanstack/",
  "react-router",
  "/lib/api",
  "/lib/query",
  "/components/issue",
  "/components/agent",
];
const productTokens = [
  "--accent",
  "--brand-color-",
  "--bg",
  "--canvas",
  "--fg",
  "--line",
  "--r-sm",
  "--r-md",
];
const violations = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(path);
      continue;
    }
    if (extname(entry.name) === ".js") {
      violations.push(`${relative(root, path)}: compiled JavaScript must live in dist, not src`);
      continue;
    }
    if (![".ts", ".tsx", ".css"].includes(extname(entry.name))) continue;
    const content = await readFile(path, "utf8");
    const displayPath = relative(root, path);
    const lineCount = content === ""
      ? 0
      : content.split(/\r?\n/).length - (content.endsWith("\n") ? 1 : 0);
    if (lineCount > 500) {
      violations.push(`${displayPath}: ${lineCount} lines exceeds the 500-line source limit`);
    }
    const isThemeAdapter = displayPath.startsWith(`styles${join("/", "themes")}`);
    for (const value of forbiddenImports) {
      if (content.includes(value)) violations.push(`${displayPath}: forbidden dependency ${value}`);
    }
    if (entry.name !== "contract.css" && !isThemeAdapter) {
      for (const token of productTokens) {
        if (content.includes(`var(${token}`)) {
          violations.push(`${displayPath}: product token ${token} bypasses the --ui-* contract`);
        }
      }
    }
    if (!path.includes(`${join("internal", "headless")}`) && content.includes("@base-ui/react")) {
      violations.push(`${displayPath}: Base UI imports belong under internal/headless`);
    }
  }
}

await visit(root);

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("UI dependency and token boundaries are valid.");
}
