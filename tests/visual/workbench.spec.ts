import { expect, test } from "@playwright/test";

// Cause/effect decision table:
// W1 desktop + long editor scroll -> controls and assistant remain in view;
// W2 tall assistant + focus last input -> only its bounded rail scrolls;
// W3 collapse/reopen or Test/Design -> uncontrolled drafts remain unchanged;
// W4 mobile LTR/RTL -> one visible mode, ordinary page scroll, no overflow.
// W5 collapsed rail + product-controlled Describe -> visible assistant, same
// draft; hide from Describe -> Design, not an empty conversation viewport.
for (const direction of ["ltr", "rtl"]) {
  test(`desktop ${direction} workbench retains reachable controls and drafts`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/workbench");
    await page.evaluate((dir) => { document.documentElement.dir = dir; }, direction);
    await page.getByLabel("Design field 1", { exact: true }).fill("preserved draft");
    const viewport = page.locator(".workbench-gallery__scroll");
    await viewport.evaluate((node) => { node.scrollTop = 800; });
    const modes = page.getByRole("group", { name: "Design modes" });
    await expect(modes).toBeInViewport();
    const rail = page.getByRole("region", { name: "Design assistant" });
    await expect(rail.getByRole("heading")).toBeInViewport();
    const railBox = await rail.boundingBox();
    const modesBox = await modes.boundingBox();
    expect(railBox!.y).toBeGreaterThanOrEqual(modesBox!.y + modesBox!.height);
    expect(railBox!.y + railBox!.height).toBeLessThanOrEqual(900);
    const priorScroll = await viewport.evaluate((node) => node.scrollTop);
    await page.getByLabel("Assistant message").focus();
    await expect(page.getByLabel("Assistant message")).toBeInViewport();
    expect(await viewport.evaluate((node) => node.scrollTop)).toBe(priorScroll);
    await modes.getByRole("button", { name: "Hide assistant" }).click();
    await expect(rail).toBeHidden();
    await page.getByRole("button", { name: "Request assistance" }).click();
    await expect(rail).toBeVisible();
    await expect(modes.getByRole("button", { name: "Describe", exact: true })).toHaveAttribute("aria-pressed", "true");
    await modes.getByRole("button", { name: "Hide assistant" }).click();
    await expect(modes.getByRole("button", { name: "Design", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(rail).toBeHidden();
    await modes.getByRole("button", { name: "Show assistant" }).click();
    await modes.getByRole("button", { name: "Test", exact: true }).click();
    await page.getByLabel("Test input").fill("preserved test");
    await modes.getByRole("button", { name: "Design", exact: true }).click();
    await expect(page.getByLabel("Design field 1", { exact: true })).toHaveValue("preserved draft");
    await modes.getByRole("button", { name: "Test", exact: true }).click();
    await expect(page.getByLabel("Test input")).toHaveValue("preserved test");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`mobile ${direction} workbench keeps one unbounded page pane`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/workbench");
    await page.evaluate((dir) => { document.documentElement.dir = dir; }, direction);
    await page.getByRole("button", { name: "Request assistance" }).click();
    const rail = page.getByRole("region", { name: "Design assistant" });
    await expect(rail).toHaveCSS("position", "static");
    await expect(rail).toHaveCSS("max-height", "none");
    await expect(page.getByRole("region", { name: "Structured design" })).toBeHidden();
    await page.getByLabel("Assistant message").fill("mobile draft");
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect(rail).toBeHidden();
    await page.getByRole("button", { name: "Describe", exact: true }).click();
    await expect(page.getByLabel("Assistant message")).toHaveValue("mobile draft");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
