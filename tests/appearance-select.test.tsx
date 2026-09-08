import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AppearanceSelect } from "../src/brand/react.js";

// R9 two React callers + native choice -> both project the same controller;
// unmount/remount -> persisted live selection survives, no component-local store.
it("shares the appearance selection across React callers", () => {
  const labels = { label: "Appearance", system: "System", light: "Light", dark: "Dark" };
  const view = render(<><AppearanceSelect labels={labels} /><AppearanceSelect labels={{ ...labels, label: "外观" }} /></>);
  fireEvent.change(screen.getByRole("combobox", { name: "Appearance" }), { target: { value: "dark" } });
  expect(screen.getByRole("combobox", { name: "外观" })).toHaveValue("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
  view.unmount();
  render(<AppearanceSelect labels={labels} />);
  expect(screen.getByRole("combobox", { name: "Appearance" })).toHaveValue("dark");
});
