import { readFileSync } from "node:fs";
import { AxeBuilder } from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { appearanceBootstrap } from "../../src/brand/appearance.js";

const styles = ["contract", "family", "components-core", "components-forms-data", "components-feedback-identity"]
  .map((name) => readFileSync(`src/styles/${name}.css`, "utf8")).join("\n");

// Decision table: brand (four) x OS (light/dark) x width (desktop/narrow).
// All combinations must resolve native controls and shared tokens together,
// preserve long Chinese text and focus, and pass applicable WCAG contrast rules.
// Explicit mode wins over later OS changes; system mode resumes live changes.
for (const mode of ["light", "dark"] as const) {
  for (const brand of ["works", "agents", "objects", "workforce"]) {
    test(`${brand} ${mode} appearance handles long text and native controls`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: mode });
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.setContent(`<!doctype html><html lang="en" data-brand="${brand}"><head><title>Appearance acceptance</title><style>${styles}
        body{margin:0;padding:24px;background:var(--ui-color-canvas);color:var(--ui-color-text);font-family:var(--ui-font-body)}
        main{display:grid;gap:16px;max-width:720px;margin:auto} h1{font-size:24px} p{overflow-wrap:anywhere}
        .sample{padding:20px;background:var(--ui-color-surface);border:1px solid var(--ui-color-border);border-radius:var(--ui-radius-surface)}
        .status{color:var(--ui-color-warning-text)} .failure{color:var(--ui-color-danger)}
      </style><script>${appearanceBootstrap()}</script></head><body><main>
        <h1>Awaken ${brand}</h1><section class="sample"><h2>主题与交互</h2><p>审核跨团队协作产生的结果，保留任务上下文与人工确认记录。</p>
        <label for="name">任务名称 / Name</label><input class="ui-input" id="name" value="需要复核的跨工作区任务" />
        <p class="status">Waiting for review · 等待人工确认</p><p class="failure">Could not save · 无法保存，请重试</p>
        <button class="ui-button" data-variant="primary">Review / 复核</button> <button class="ui-button" disabled>Saving / 正在保存</button>
        </section><label for="appearance">Appearance / 外观</label><select id="appearance" class="ui-input" data-appearance-select><option value="system">System / 跟随系统</option><option value="light">Light / 浅色</option><option value="dark">Dark / 深色</option></select>
        </main></body></html>`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
      await expect(page.locator("html")).toHaveCSS("color-scheme", mode);
      await expect(page.getByLabel("任务名称 / Name")).toHaveCSS("font-family", /system-ui/);
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(audit.violations).toEqual([]);
      await expect(page.locator("main")).toHaveScreenshot(`appearance-${brand}-${mode}.png`);
      await page.getByLabel("任务名称 / Name").focus();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Review / 复核" })).toBeFocused();
      await expect(page.getByRole("button", { name: "Review / 复核" })).toHaveCSS("outline-style", "solid");
      await page.setViewportSize({ width: 360, height: 780 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const select = page.getByLabel("Appearance / 外观");
      await select.selectOption(mode === "dark" ? "light" : "dark");
      await page.emulateMedia({ colorScheme: mode });
      await expect(page.locator("html")).toHaveAttribute("data-theme", mode === "dark" ? "light" : "dark");
      await select.selectOption("system");
      await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
      await page.emulateMedia({ colorScheme: mode === "dark" ? "light" : "dark" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", mode === "dark" ? "light" : "dark");
    });
  }
}
