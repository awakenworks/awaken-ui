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
  test(`Popover under ${theme} tokens`, async ({ page }) => {
    await page.getByRole("button", { name: `${theme} tokens` }).click();
    await page.getByRole("button", { name: "Open actions" }).click();
    const scene = page
      .getByRole("heading", { name: "Overlays and transient feedback" })
      .locator("..");
    await expect(scene).toHaveScreenshot(`popover-${theme.toLowerCase()}.png`);
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
}
