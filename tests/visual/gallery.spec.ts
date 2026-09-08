import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Identity and Agent conversation" })).toBeVisible();
});

test("Agent conversation under Awaken tokens", async ({ page }) => {
  await page.getByRole("button", { name: "Awaken tokens" }).click();
  const scene = page.getByRole("heading", { name: "Identity and Agent conversation" }).locator("..");
  await expect(scene).toHaveScreenshot("agent-chat-awaken.png");
});

test("Agent conversation under Oversight tokens", async ({ page }) => {
  await page.getByRole("button", { name: "Oversight tokens" }).click();
  const scene = page.getByRole("heading", { name: "Identity and Agent conversation" }).locator("..");
  await expect(scene).toHaveScreenshot("agent-chat-oversight.png");
});

for (const theme of ["Awaken", "Oversight"] as const) {
  test(`Buttons and switch under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Buttons" }).locator("..");
    await expect(scene).toHaveScreenshot(`buttons-switch-${theme.toLowerCase()}.png`);
  });

  test(`Popover under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    await page.getByRole("button", { name: "Open actions" }).click();
    const scene = page
      .getByRole("heading", { name: "Overlays and transient feedback" })
      .locator("..");
    await expect(scene).toHaveScreenshot(`popover-${theme.toLowerCase()}.png`);
  });

  test(`Dialog under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog", { name: "Edit settings" })).toHaveScreenshot(
      `dialog-${theme.toLowerCase()}.png`,
    );
  });

  test(`Drawer under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    await page.getByRole("button", { name: "Open drawer" }).click();
    await expect(page.getByRole("dialog", { name: "Resource details" })).toHaveScreenshot(
      `drawer-${theme.toLowerCase()}.png`,
    );
  });

  test(`Metric cards under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Metric cards" }).locator("..");
    await expect(scene).toHaveScreenshot(`stat-card-${theme.toLowerCase()}.png`);
  });

  test(`Navigation and structured information under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Navigation and structured information" }).locator("..");
    await expect(scene).toHaveScreenshot(`navigation-information-${theme.toLowerCase()}.png`);
  });

  test(`Navigation information is accessible under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const results = await new AxeBuilder({ page })
      .include("main")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`Navigation information handles mobile long content under ${theme} tokens`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Navigation and structured information" }).locator("..");
    await scene.getByRole("link", { name: "Platform" }).evaluate((node) => {
      node.textContent = "A-very-long-localized-workspace-name-without-break-opportunities";
    });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(scene).toHaveScreenshot(`navigation-information-mobile-${theme.toLowerCase()}.png`);
  });

  test(`Navigation information supports RTL under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    await page.locator("html").evaluate((node) => node.setAttribute("dir", "rtl"));
    const scene = page.getByRole("heading", { name: "Navigation and structured information" }).locator("..");
    await expect(scene).toHaveScreenshot(`navigation-information-rtl-${theme.toLowerCase()}.png`);
  });

  test(`Editor form under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Editor form" }).locator("..");
    await expect(scene).toHaveScreenshot(`editor-form-${theme.toLowerCase()}.png`);
  });

  test(`Form fields under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Form fields" }).locator("..");
    await expect(scene).toHaveScreenshot(`form-fields-${theme.toLowerCase()}.png`);
  });

  test(`Confirmation under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    await page.getByRole("button", { name: "Confirm action" }).click();
    await expect(page.getByRole("alertdialog")).toHaveScreenshot(
      `confirm-${theme.toLowerCase()}.png`,
    );
  });

  test(`Schema form under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Schema form" }).locator("..");
    await expect(scene).toHaveScreenshot(`schema-form-${theme.toLowerCase()}.png`);
  });

  test(`Secret field under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Secret field" }).locator("..");
    await expect(scene).toHaveScreenshot(`secret-field-${theme.toLowerCase()}.png`);
  });

  test(`Data grid under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Data grid" }).locator("..");
    await expect(scene).toHaveScreenshot(`data-grid-${theme.toLowerCase()}.png`);
  });

  test(`JSON inspector under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "JSON inspector" }).locator("..");
    await expect(scene).toHaveScreenshot(`json-inspector-${theme.toLowerCase()}.png`);
  });
}

test("Navigation information remains distinguishable in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const scene = page.getByRole("heading", { name: "Navigation and structured information" }).locator("..");
  await expect(scene).toHaveScreenshot("navigation-information-forced-colors.png");
});

test("Navigation information exposes the expected accessibility tree and keyboard path", async ({ page }) => {
  const scene = page.getByRole("heading", { name: "Navigation and structured information" }).locator("..");
  const accessibilityTree = await scene.ariaSnapshot();
  expect(accessibilityTree).toContain('navigation "Location"');
  expect(accessibilityTree).toContain('navigation "Resource pages"');
  expect(accessibilityTree).toContain('tablist "Agent editor sections"');
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Tools" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Product-owned tool configuration");
});

for (const theme of ["Awaken", "Oversight"] as const) {
  test(`Shared navigation and intrinsic table under ${theme} tokens`, async ({ page }) => {
    // Rules: R1 both token maps -> aligned intrinsic columns with no product CSS;
    // R2 current row disabled -> menu remains; R3 authorized link -> menu closes.
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    const scene = page.getByRole("heading", { name: "Shared product navigation and intrinsic table" }).locator("..");
    const header = await scene.getByRole("columnheader", { name: "Status" }).boundingBox();
    const cell = await scene.getByRole("cell", { name: "Ready", exact: true }).boundingBox();
    expect(Math.abs(header!.x - cell!.x)).toBeLessThan(1);
    await expect(scene).toHaveScreenshot(`shared-navigation-table-${theme.toLowerCase()}.png`);
    await scene.getByRole("button", { name: "Products" }).click();
    await page.getByRole("menuitem", { name: /Current/ }).dispatchEvent("click");
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menu")).toHaveScreenshot(`suite-menu-${theme.toLowerCase()}.png`);
    await page.getByRole("menuitem", { name: "Account", exact: true }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
}
