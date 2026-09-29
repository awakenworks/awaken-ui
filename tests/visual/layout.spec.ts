import { expect, test } from "@playwright/test";

// State geometry cause/effect table:
// S1 neutral EmptyState -> stacked title/body/action, not a loading row;
// S2 danger ErrorState -> the same block structure; S3 LoadingState/LoadingRow
// -> compact flex status rows. Cross both token profiles, narrow/wide and RTL.
// Long translated/unbroken content stays inside its owner; each native action
// is keyboard reachable and fires once. CSS never infers a product/API state.
for (const profile of ["Awaken", "Oversight"]) {
  for (const width of [320, 1280]) {
    for (const direction of ["ltr", "rtl"]) {
      test(`feedback blocks ${profile}/${width}/${direction} preserve readable order and actions`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/feedback");
        await page.getByRole("button", { name: `${profile} tokens` }).click();
        await page.evaluate((dir) => { document.documentElement.dir = dir; }, direction);
        const scene = page.getByRole("region", { name: "Feedback states" });
        // Geometry uses the public styling hook so changing fixture text does
        // not invalidate the locator. Interaction still uses native roles.
        const empty = scene.locator(".ui-state--neutral").filter({ has: page.getByRole("heading") });
        const error = scene.locator(".ui-state--danger");
        for (const block of [empty, error]) {
          await block.locator("h2").evaluate((node) => { node.textContent = "لا توجد بيانات متاحة · 未找到匹配记录"; });
          await block.locator("p").evaluate((node) => { node.textContent = "UnbrokenLocalizedRecoveryIdentifier".repeat(6); });
          await expect(block).toHaveCSS("display", "grid");
          const heading = await block.locator("h2").boundingBox();
          const body = await block.locator("p").boundingBox();
          const action = await block.getByRole("button").boundingBox();
          const box = await block.boundingBox();
          expect(body!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height);
          expect(action!.y).toBeGreaterThanOrEqual(body!.y + body!.height);
          expect(body!.x).toBeGreaterThanOrEqual(box!.x);
          expect(body!.x + body!.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
        }
        for (const status of await scene.getByRole("status").filter({ hasText: /^Loading/ }).all()) await expect(status).toHaveCSS("display", "flex");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const create = scene.getByRole("button", { name: "Create record" });
        await create.focus();
        await page.keyboard.press("Enter");
        await expect(scene.getByLabel("Feedback action count")).toHaveText("1");
        await scene.getByRole("button", { name: "Retry records" }).focus();
        await page.keyboard.press("Enter");
        await expect(scene.getByLabel("Feedback action count")).toHaveText("2");
        if (width === 1280 && direction === "ltr") {
          await expect(scene).toHaveScreenshot(`feedback-states-${profile.toLowerCase()}.png`);
        }
      });
    }
  }
}

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

// E1-E6: empty/icon/text marker x ordinary/forced colors. Only an empty marker
// owns the default dot; supplied content has a full-size transparent slot.
// Supplied content stays at the top instead of stretching through body/metadata.
// Both paths retain one rail and decorative semantics; no event state changes.
for (const markerKind of ["empty", "icon", "text"]) {
  for (const forcedColors of ["none", "active"] as const) {
    test(`event marker ${markerKind} in ${forcedColors} colors has one visual owner`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      await page.emulateMedia({ forcedColors });
      await page.goto("/");
      const marker = page.locator(".ui-event-list__marker").first();
      await marker.evaluate((node, kind) => {
        if (kind === "icon") {
          const icon = document.querySelector('svg[viewBox="0 0 24 24"]')!;
          node.replaceChildren(icon.cloneNode(true));
        } else if (kind === "text") node.textContent = "1";
      }, markerKind);
      const shape = await marker.evaluate((node) => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return { width: box.width, height: box.height, background: style.backgroundColor };
      });
      if (markerKind === "empty") {
        expect(shape.width).toBe(8);
        expect(shape.height).toBe(8);
        expect(shape.background).not.toMatch(/^rgba\([^,]+,[^,]+,[^,]+,\s*0\)$/);
      } else {
        expect(shape.width).toBeGreaterThanOrEqual(16);
        expect(shape.height).toBeLessThanOrEqual(24);
        // Forced colors changes RGB channels even for transparent pixels.
        expect(shape.background).toMatch(/^rgba\([^,]+,[^,]+,[^,]+,\s*0\)$/);
      }
      await expect(marker.locator("..")).toHaveAttribute("aria-hidden", "true");
      const list = page.getByRole("list", { name: "Recent events" });
      await expect(list.getByRole("listitem")).toHaveCount(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
