import { expect, test } from "@playwright/test";

// Cause/effect table: document explicit theme wins over system, while no
// document choice follows system. Explicit surface wins over both. Brand
// geometry and 16/24/48px proportions are invariant across those choices.
// R1 light+system-dark -> light palette; R2 dark+system-light -> dark palette;
// R3 unset+system-dark -> dark; R4 explicit-on-light+dark -> light;
// R5 forced-colors -> system text color, still recognizable by silhouette.
test("brand family shares geometry across surfaces and optical sizes", async ({ page }) => {
  await page.goto("/");
  const family = page.getByRole("region", { name: "Awaken brand family" });
  await expect(family.locator("svg")).toHaveCount(24);
  await expect(family).toHaveScreenshot("brand-family.png");
  const mark = family.locator('[data-theme="light"] [data-brand-mark="agents"]').first();
  const fill = () => mark.locator("path").evaluate((node) => getComputedStyle(node).fill);
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await fill()).toBe("rgb(15, 111, 123)");
  await mark.locator("..").locator("..").evaluate((node) => node.setAttribute("data-theme", "dark"));
  await page.emulateMedia({ colorScheme: "light" });
  const changed = family.locator('[data-brand-mark="agents"]').first();
  expect(await changed.locator("path").evaluate((node) => getComputedStyle(node).fill)).toBe("rgb(104, 206, 217)");
  await changed.locator("..").locator("..").evaluate((node) => node.removeAttribute("data-theme"));
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await changed.locator("path").evaluate((node) => getComputedStyle(node).fill)).toBe("rgb(104, 206, 217)");
  await changed.evaluate((node) => {
    node.setAttribute("data-mark-scheme", "on-light");
  });
  expect(await changed.locator("path").evaluate((node) => getComputedStyle(node).fill)).toBe("rgb(15, 111, 123)");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(family).toHaveScreenshot("brand-family-forced-colors.png");
});
