const controls = 'input:not([type="hidden"]), textarea, select, button, a[href], summary, [tabindex], [contenteditable="true"]';

function available(element: HTMLElement, restoring: boolean): boolean {
  if (!element.isConnected || element.matches(':disabled, [aria-disabled="true"]')) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hidden || (!restoring && (ancestor.hasAttribute("inert") || ancestor.getAttribute("aria-hidden") === "true"))) return false;
    const style = element.ownerDocument.defaultView?.getComputedStyle(ancestor);
    if (style?.display === "none" || style?.visibility === "hidden" || style?.visibility === "collapse") return false;
  }
  return true;
}

/** Explicit field/section navigation only. The caller owns destination and
 * timing; this function never activates a control or performs a command. */
export function revealAndFocus(target: HTMLElement | null | undefined): boolean {
  const control = revealFocusTarget(target);
  if (!control) return false;
  control.focus({ preventScroll: true });
  if (control.ownerDocument.activeElement !== control) return false;
  control.scrollIntoView?.({ block: "center", inline: "nearest", behavior: "auto" });
  return true;
}

/** Package-private preparation for the existing modal final-focus owner. Its
 * background can still be inert during cleanup; only that engine may perform
 * focus after removing the modal boundary. This helper never focuses. */
export function revealFocusTarget(target: HTMLElement | null | undefined, restoring = false): HTMLElement | undefined {
  if (!target || !available(target, restoring)) return;
  const candidates = target.matches(controls) ? [target] : [...target.querySelectorAll<HTMLElement>(controls)];
  const control = candidates.find((candidate) => available(candidate, restoring));
  if (!control) return;
  for (let ancestor = control.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.tagName === "DETAILS") (ancestor as HTMLDetailsElement).open = true;
  }
  return control;
}
