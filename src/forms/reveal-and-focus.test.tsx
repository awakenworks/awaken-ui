import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { revealAndFocus } from "../index.js";

afterEach(cleanup);

it("reveals nested disclosures and focuses without changing or activating inputs", () => {
  // Cause/effect rules: R1 connected enabled field + nested closed details ->
  // every ancestor opens and exact focus moves; no click/input/change/submit.
  const command = vi.fn();
  render(<form onSubmit={command} onChange={command} onInput={command} onClick={command}>
    <details><summary>Outer</summary><details><summary>Inner</summary>
      <input aria-label="Value" defaultValue="retained" />
    </details></details>
  </form>);
  const input = screen.getByLabelText("Value");
  expect(revealAndFocus(input)).toBe(true);
  expect(input).toHaveFocus();
  expect(input).toHaveValue("retained");
  expect([...document.querySelectorAll("details")].every((item) => item.open)).toBe(true);
  expect(command).not.toHaveBeenCalled();
});

it("rejects unavailable targets without opening disclosures or moving focus", () => {
  // R2 hidden/inert/display-none/disabled/detached/absent -> no disclosure or
  // focus effect. These constraints take precedence over explicit navigation.
  render(<><button>Origin</button><details><summary>Closed</summary>
    <div hidden><input aria-label="Hidden" /></div>
    <div inert><input aria-label="Inert" /></div>
    <div style={{ display: "none" }}><input aria-label="Not displayed" /></div>
    <input aria-label="Disabled" disabled />
  </details></>);
  screen.getByRole("button").focus();
  for (const label of ["Hidden", "Inert", "Not displayed", "Disabled"]) expect(revealAndFocus(screen.getByLabelText(label))).toBe(false);
  expect(revealAndFocus(document.createElement("input"))).toBe(false);
  expect(revealAndFocus(null)).toBe(false);
  expect(screen.getByRole("button")).toHaveFocus();
  expect(document.querySelector("details")?.open).toBe(false);
});

it("uses the first available section control and permits read-only inspection", () => {
  // R3 section + unavailable early controls -> first available native control;
  // R4 read-only field -> focus only, still read-only; R5 repeated request ->
  // explicit focus can return to the same field without a timer or activation.
  const { container } = render(<section><input disabled /><input hidden />
    <input aria-label="Inspect" readOnly value="unchanged" /><button>Other</button></section>);
  expect(revealAndFocus(container.firstElementChild as HTMLElement)).toBe(true);
  expect(screen.getByLabelText("Inspect")).toHaveFocus();
  screen.getByRole("button").focus();
  expect(revealAndFocus(screen.getByLabelText("Inspect"))).toBe(true);
  expect(screen.getByLabelText("Inspect")).toHaveFocus();
  expect(screen.getByLabelText("Inspect")).toHaveAttribute("readonly");
});
