import { expect, test } from "@playwright/test";

// Cause/effect decision table:
// W1 desktop + long editor scroll -> controls and assistant remain in view;
// W2 tall assistant + focus last input -> only its bounded rail scrolls;
// W3 collapse/reopen or Test/Design -> uncontrolled drafts remain unchanged;
// W4 mobile LTR/RTL -> one visible mode, ordinary page scroll, no overflow.
// W5 collapsed rail + product-controlled Describe -> visible assistant, same
// draft; hide from Describe -> Design, not an empty conversation viewport.
for (const direction of ["ltr", "rtl"]) {
  for (const width of [320, 1280]) for (const side of ["start", "end"]) {
    test(`initially collapsed ${side} rail gives ${width}px ${direction} editing the full width`, async ({ page }) => {
      // I1 initially collapsed + either rail side/direction/viewport -> no
      // empty reserved column and no accessible conversation controls. I2 user
      // Describe/reopen -> same mounted values; Design restores the full main
      // task. Native controls remain keyboard reachable, with zero overflow.
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/workbench?rail=collapsed&side=${side}`);
      await page.evaluate((dir) => { document.documentElement.dir = dir; }, direction);
      const editor = page.getByRole("region", { name: "Structured design" });
      const workbench = page.locator(".ui-design-workbench");
      const assertFocusedWidth = async () => {
        const available = await workbench.boundingBox();
        const focused = await editor.boundingBox();
        expect(focused!.width).toBeGreaterThanOrEqual(available!.width * 0.99);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      };
      await assertFocusedWidth();
      await expect(page.getByRole("textbox", { name: "Assistant message" })).toHaveCount(0);
      await page.getByLabel("Design field 1", { exact: true }).fill("focused manual draft");
      const modes = page.getByRole("group", { name: "Design modes" });
      const describe = modes.getByRole("button", { name: "Describe", exact: true });
      await describe.focus();
      await describe.press("Enter");
      // C6 mounted while hidden + revealed at real browser geometry -> the
      // shared composer has a visible native row and accepts keyboard input.
      // Value, visibility and reflow remain UI behavior, not a product command.
      await expect(page.getByLabel("Assistant message")).toBeVisible();
      await page.getByLabel("Assistant message").fill("retained optional request");
      await modes.getByRole("button", { name: "Design", exact: true }).click();
      await expect(page.getByLabel("Design field 1", { exact: true })).toHaveValue("focused manual draft");
      if (width >= 640) {
        const hide = modes.getByRole("button", { name: "Hide assistant" });
        await hide.click();
        await assertFocusedWidth();
        const show = modes.getByRole("button", { name: "Show assistant" });
        await expect(show).toBeFocused();
        await show.press("Enter");
      } else await describe.click();
      await expect(page.getByLabel("Assistant message")).toHaveValue("retained optional request");
    });
  }

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

test("a hidden composer reflows its retained draft on reveal and viewport changes", async ({ page }) => {
  // C7 hidden mount -> reveal -> multiline input; C8 collapse/reveal at the
  // same width retains the same draft and sizing; C9 narrow RTL -> text reflows
  // within the real viewport. No fake DOM geometry or forced input activation.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/workbench?rail=collapsed");
  const modes = page.getByRole("group", { name: "Design modes" });
  await modes.getByRole("button", { name: "Describe", exact: true }).click();
  const input = page.getByLabel("Assistant message");
  const value = "Retained multiline draft\n".repeat(5);
  await input.fill(value);
  const measured = await input.evaluate(node => ({ height: node.clientHeight, content: node.scrollHeight }));
  expect(measured.height).toBeGreaterThan(0);
  expect(measured.height).toBe(measured.content);
  await modes.getByRole("button", { name: "Hide assistant" }).click();
  await modes.getByRole("button", { name: "Show assistant" }).click();
  await expect(input).toHaveValue(value);
  await expect(input).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.locator("html").evaluate(node => { node.setAttribute("dir", "rtl"); });
  await modes.getByRole("button", { name: "Describe", exact: true }).click();
  await expect(input).toHaveValue(value);
  await input.fill("مسودة محفوظة\n".repeat(4));
  expect(await input.evaluate(node => node.clientHeight)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
