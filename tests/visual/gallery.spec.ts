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
