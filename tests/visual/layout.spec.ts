import { expect, test } from "@playwright/test";

// Description rules D1-D6: authored columns (2/3) x viewport (360/640/1280).
// At <=40rem every list becomes one column; above it authored columns win.
// Zero values, long identifiers and native term/detail structure remain intact.
for (const columns of [2, 3]) {
  for (const width of [360, 640, 1280]) {
    test(`description ${columns} columns at ${width}px preserves responsive structure`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const list = page.locator(".ui-description-list").first();
      await list.evaluate((node, count) => {
        node.setAttribute("data-columns", String(count));
        node.querySelector("dd")!.textContent = "0";
        node.querySelectorAll("dd")[1]!.textContent = "跨工作区审核结果".repeat(20);
      }, columns);
      const tracks = await list.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
      expect(tracks).toBe(width <= 640 ? 1 : columns);
      await expect(list.locator("dt + dd").first()).toHaveText("0");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

// Tab rules T1-T4: two token profiles x unbroken Latin/CJK labels at 360px.
// The tab strip scrolls within its owner, keyboard End reveals and selects the
// last tab, its focus remains visible, and Home restores the first panel.
// Addressable links use the same strip but retain native Tab/Enter navigation.
for (const profile of ["Awaken", "Oversight"]) {
  for (const language of ["en", "zh"]) {
    test(`${profile} ${language} long tabs stay reachable on a narrow page`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto("/");
      await page.getByRole("button", { name: `${profile} tokens` }).click();
      const list = page.getByRole("tablist", { name: "Agent editor sections" });
      const tabs = list.getByRole("tab");
      await tabs.evaluateAll((nodes, language) => nodes.forEach((node, index) => {
        node.textContent = `${index} ${language === "zh" ? "跨团队审核与权限配置".repeat(3) : "UnbrokenLocalizedConfigurationLabel".repeat(3)}`;
      }), language);
      const first = tabs.first();
      const last = tabs.last();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await first.focus();
      await page.keyboard.press("End");
      await expect(last).toBeFocused();
      await expect(last).toHaveAttribute("aria-selected", "true");
      await expect(last).toHaveCSS("outline-style", "solid");
      expect(await list.evaluate((node) => node.scrollLeft > 0)).toBe(true);
      await expect(page.getByRole("tabpanel")).toContainText("Product-owned tool configuration");
      await page.keyboard.press("Home");
      await expect(first).toBeFocused();
      await expect(first).toHaveAttribute("aria-selected", "true");
      const navigation = page.getByRole("navigation", { name: "Resource pages" });
      const links = navigation.getByRole("link");
      await links.evaluateAll((nodes) => nodes.forEach((node) => {
        node.textContent = "跨工作区设置与审核".repeat(10);
      }));
      await links.first().focus();
      await page.keyboard.press("Tab");
      await expect(links.last()).toBeFocused();
      await expect(links.last()).toHaveCSS("outline-style", "solid");
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#settings$/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

// N1-N4: icon present/absent x narrow/wide. Content owns a flexible track;
// the action remains inside the notice and reachable by keyboard in both cases.
// DOM fixture changes only optional decoration; the actual shared recipe is used.
for (const hasIcon of [false, true]) {
  for (const width of [360, 1280]) {
    test(`notice icon=${hasIcon} at ${width}px retains its action`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const notice = page.locator(".ui-inline-notice").first();
      await notice.evaluate((node, withIcon) => {
        node.querySelector(".ui-inline-notice__body")!.textContent = "跨工作区权限配置".repeat(12);
        if (withIcon) {
          const icon = document.createElement("span");
          icon.className = "ui-inline-notice__icon";
          icon.textContent = "i";
          icon.setAttribute("aria-hidden", "true");
          node.prepend(icon);
        }
      }, hasIcon);
      const action = notice.getByRole("button", { name: "Configure" });
      await action.focus();
      await expect(action).toBeFocused();
      const box = await notice.boundingBox();
      const actionBox = await action.boundingBox();
      expect(actionBox!.x).toBeGreaterThanOrEqual(box!.x);
      expect(actionBox!.x + actionBox!.width).toBeLessThanOrEqual(box!.x + box!.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
