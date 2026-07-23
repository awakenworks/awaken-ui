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
