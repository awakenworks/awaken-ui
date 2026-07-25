import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineNotice } from "./inline-notice.js";

describe("InlineNotice", () => {
  it("does not infer live-region semantics from its visual tone", () => {
    render(<InlineNotice tone="danger" title="Access required">Configure access.</InlineNotice>);
    expect(screen.getByText("Access required").closest(".ui-inline-notice")).not.toHaveAttribute("role");
  });

  it("preserves caller-supplied alert semantics", () => {
    render(<InlineNotice role="alert">Connection failed.</InlineNotice>);
    expect(screen.getByRole("alert")).toHaveTextContent("Connection failed.");
  });

  it("renders numeric React nodes including zero", () => {
    const { container } = render(<InlineNotice title={0} details={0} actions={0}>{0}</InlineNotice>);
    expect(container.querySelector(".ui-inline-notice__title")).toHaveTextContent("0");
    expect(container.querySelector(".ui-inline-notice__body")).toHaveTextContent("0");
    expect(container.querySelector(".ui-inline-notice__details")).toHaveTextContent("0");
    expect(container.querySelector(".ui-inline-notice__actions")).toHaveTextContent("0");
  });
});
