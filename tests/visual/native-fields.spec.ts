import { expect, test } from "@playwright/test";

test("native field state preserves its semantic surface in an isolated color context", async ({ page }) => {
  // Cause/effect decision table: readonly text input/textarea -> canvas;
  // writable text input/textarea AND enabled select -> surface; disabled any
  // control -> canvas + disabled cursor. CSS :read-only matches an enabled
  // select but must not imply readonly UI/permission. Native selection remains
  // operable; no product state, callback or API is present in this recipe test.
  await page.goto("/");
  await page.evaluate(() => {
    const region = document.createElement("section"); region.id = "field-state-test";
    region.style.setProperty("--ui-color-surface", "rgb(10, 20, 30)");
    region.style.setProperty("--ui-color-canvas", "rgb(230, 240, 250)");
    for (const tag of ["input", "textarea", "select"] as const) for (const state of ["editable", "readonly", "disabled"]) {
      if (tag === "select" && state === "readonly") continue;
      const field = document.createElement(tag); field.className = "ui-input";
      field.setAttribute("aria-label", `${tag} ${state}`);
      field.disabled = state === "disabled";
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.readOnly = state === "readonly";
      if (field instanceof HTMLSelectElement) for (const value of ["one", "two"]) { const option = document.createElement("option"); option.value = value; option.textContent = value; field.append(option); }
      region.append(field);
    }
    document.body.prepend(region);
  });
  for (const tag of ["input", "textarea", "select"]) for (const state of ["editable", "readonly", "disabled"]) {
    if (tag === "select" && state === "readonly") continue;
    const field = page.getByLabel(`${tag} ${state}`, { exact: true });
    await expect(field).toHaveCSS("background-color", state === "editable" ? "rgb(10, 20, 30)" : "rgb(230, 240, 250)");
    if (state === "disabled") await expect(field).toBeDisabled(); else await expect(field).toBeEnabled();
  }
  const select = page.getByRole("combobox", { name: "select editable" });
  expect(await select.evaluate(node => node.matches(":read-only"))).toBe(true);
  await select.selectOption("two"); await expect(select).toHaveValue("two");
});
