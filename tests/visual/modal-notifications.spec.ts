import { expect, test } from "@playwright/test";

for (const direction of ["ltr", "rtl"] as const) for (const width of [1280, 390]) {
  test(`queued notification cannot intercept a modal action at ${width} ${direction}`, async ({ page }) => {
    // DT-MODAL-NOTIFICATION: C1 queued interactive notification; C2 modal open;
    // C3 their rectangles overlap; C4 desktop/mobile and either direction.
    // R1 C1+C2+C3 -> the natural pointer reaches Save without outside dismissal.
    // R2 closing the modal -> the same notification becomes dismissible again.
    // The gallery uses duration=0: waiting out a timer cannot hide the defect.
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.locator("html").evaluate((node, dir) => { node.setAttribute("dir", dir); }, direction);
    await page.getByRole("button", { name: "Show toast", exact: true }).click();
    await page.getByRole("button", { name: "Open dialog", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Edit settings" });
    const save = dialog.getByRole("button", { name: "Save", exact: true });
    await expect(save).toBeVisible();
    const box = await save.boundingBox();
    expect(box).not.toBeNull();
    await page.locator(".ui-toast-region").evaluate((region, rect) => {
      Object.assign((region as HTMLElement).style, {
        inset: "auto", top: `${rect!.y}px`, left: `${rect!.x}px`, width: `${rect!.width}px`,
      });
    }, box);
    await save.evaluate((node) => node.addEventListener("click", () => { document.documentElement.dataset.modalAction = "saved"; }));
    await save.click({ timeout: 5000 });
    await expect(page.locator("html")).toHaveAttribute("data-modal-action", "saved");
    await expect(dialog).toHaveCount(0);
    await page.locator(".ui-toast-region").evaluate((region) => region.removeAttribute("style"));
    await expect(page.getByRole("region", { name: "Notifications" }).getByRole("status")).toContainText("The draft was saved.");
    await page.getByRole("button", { name: "Dismiss notification", exact: true }).click();
    await expect(page.getByRole("region", { name: "Notifications" }).getByRole("status")).toHaveCount(0);
  });
}
