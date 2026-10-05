import { expect, test } from "@playwright/test";

for (const direction of ["ltr", "rtl"] as const) {
  test(`long tool badge stays contained and keeps status beside the action (${direction})`, async ({ page }) => {
    // V1: 390px viewport + long external badge + two status pills -> no
    // horizontal card/page overflow; V2 both directions -> action and running
    // state share the first row, badges follow; V3 Enter keeps native button
    // expansion and the unchanged tool input readable.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate((value) => { document.documentElement.dir = value; }, direction);
    const section = page.getByRole("heading", { name: "Long tool identity" }).locator("..");
    const card = section.locator(".ui-chat-tool");
    const header = card.getByRole("button", { name: /read_source/ });
    await expect(header).toBeVisible();
    const geometry = await card.evaluate((node) => {
      const name = node.querySelector(".ui-chat-tool__name")!.getBoundingClientRect();
      const status = node.querySelector(".ui-chat-tool__status")!.getBoundingClientRect();
      const badges = node.querySelector(".ui-chat-tool__badges")!.getBoundingClientRect();
      return { scrollWidth: node.scrollWidth, clientWidth: node.clientWidth,
        nameTop: name.top, statusTop: status.top, badgesTop: badges.top };
    });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    expect(Math.abs(geometry.nameTop - geometry.statusTop)).toBeLessThanOrEqual(1);
    expect(geometry.badgesTop).toBeGreaterThan(geometry.nameTop);
    await header.focus();
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await expect(card.getByLabel("Tool input")).toContainText("{}");
  });
}
