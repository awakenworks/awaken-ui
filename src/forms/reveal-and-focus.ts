const controls = 'input:not([type="hidden"]), textarea, select, button, a[href], summary, [tabindex], [contenteditable="true"]';

function available(element: HTMLElement): boolean {
  if (!element.isConnected || element.matches(':disabled, [aria-disabled="true"]')) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hidden || ancestor.hasAttribute("inert") || ancestor.getAttribute("aria-hidden") === "true") return false;
    const style = element.ownerDocument.defaultView?.getComputedStyle(ancestor);
    if (style?.display === "none" || style?.visibility === "hidden" || style?.visibility === "collapse") return false;
  }
  return true;
}

/** Explicit field/section navigation only. The caller owns destination and
 * timing; this function never activates a control or performs a command. */
export function revealAndFocus(target: HTMLElement | null | undefined): boolean {
  if (!target || !available(target)) return false;
  const candidates = target.matches(controls) ? [target] : [...target.querySelectorAll<HTMLElement>(controls)];
  const control = candidates.find(available);
  if (!control) return false;
  for (let ancestor = control.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.tagName === "DETAILS") (ancestor as HTMLDetailsElement).open = true;
  }
  control.focus({ preventScroll: true });
  if (control.ownerDocument.activeElement !== control) return false;
  control.scrollIntoView?.({ block: "center", inline: "nearest", behavior: "auto" });
  return true;
}
