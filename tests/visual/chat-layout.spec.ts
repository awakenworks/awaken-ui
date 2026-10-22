import { expect, test } from "@playwright/test";

// DT-CHAT: width320/1280 x ltr/rtl. R1 initial history -> bottom; R2 following
// + composer growth -> bottom retained; R3 history + new content/resize -> top
// retained, Latest available; R4 keyboard Latest -> bottom; R5 narrow/footer ->
// text padding, full-width input, separated action, visible focus and no page
// overflow. This fixture renders the public components, not copied chat DOM.
for (const width of [320, 1280]) for (const direction of ["ltr", "rtl"]) {
  test(`chat ${width}/${direction} preserves composition and reading position`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/chat");
    await page.evaluate(dir => { document.documentElement.dir = dir; }, direction);
    const log = page.getByRole("log", { name: "Conversation history" });
    const gap = () => log.evaluate(n => n.scrollHeight - n.clientHeight - n.scrollTop);
    await expect.poll(gap).toBeLessThan(2);
    const input = page.getByRole("textbox", { name: "Message", exact: true });
    await input.fill(Array.from({ length: 12 }, (_, i) => `Line ${i}: review evidence.`).join("\n"));
    await expect.poll(gap).toBeLessThan(2);
    const form = input.locator("xpath=ancestor::form");
    const fb = (await form.boundingBox())!, ib = (await input.boundingBox())!;
    expect(ib.x - fb.x).toBeGreaterThanOrEqual(8);
    expect(fb.x + fb.width - ib.x - ib.width).toBeGreaterThanOrEqual(8);
    const send = (await form.getByRole("button", { name: "Send", exact: true }).boundingBox())!;
    expect(send.y).toBeGreaterThanOrEqual(ib.y + ib.height);
    expect(send.x).toBeGreaterThan(fb.x);
    expect(send.x + send.width).toBeLessThan(fb.x + fb.width);
    await log.focus(); await page.keyboard.press("Home");
    await expect(log).toBeFocused();
    await expect(log).toHaveCSS("outline-style", "solid");
    await expect.poll(() => log.evaluate(n => n.scrollTop)).toBeLessThan(2);
    await page.getByRole("button", { name: "Append message" }).click();
    await input.fill("Short draft");
    await expect.poll(() => log.evaluate(n => n.scrollTop)).toBeLessThan(2);
    const latest = page.getByRole("button", { name: "Latest", exact: true });
    // R6 logical direction must not reverse the anchor without reversing a
    // physical transform: in both directions Latest is centered and wholly
    // contained in its same transcript, without changing the reader's scroll.
    const transcriptBox = (await page.locator(".ui-chat-list").boundingBox())!;
    const latestBox = (await latest.boundingBox())!;
    expect(Math.abs(latestBox.x + latestBox.width / 2 - transcriptBox.x - transcriptBox.width / 2)).toBeLessThan(1);
    expect(latestBox.x).toBeGreaterThanOrEqual(transcriptBox.x);
    expect(latestBox.x + latestBox.width).toBeLessThanOrEqual(transcriptBox.x + transcriptBox.width);
    await latest.focus(); await page.keyboard.press("Enter");
    await expect.poll(gap).toBeLessThan(2);
    await page.setViewportSize({ width: width === 320 ? 640 : 390, height: 844 });
    await input.fill(Array.from({ length: 12 }, (_, i) => `Retained line ${i}: review evidence.`).join("\n"));
    await expect.poll(gap).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
