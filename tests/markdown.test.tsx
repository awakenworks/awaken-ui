import { render, screen } from "@testing-library/react";
import {
  ChatMarkdown,
  hasMarkdown,
  renderSafeMarkdown,
} from "../src/index.js";

describe("safe chat markdown", () => {
  it("keeps plain prose on the cheap text path", () => {
    expect(hasMarkdown("plain message")).toBe(false);
    render(
      <ChatMarkdown
        body="plain message"
        copyCodeLabel="Copy code"
        copiedCodeLabel="Copied"
        copyFailedLabel="Failed"
      />,
    );
    expect(screen.getByText("plain message")).toBeInTheDocument();
  });

  it("strips raw HTML, event handlers and unsafe URLs", () => {
    const html = renderSafeMarkdown(
      '<script>alert(1)</script>\n\n<img src="javascript:alert(1)" onerror="alert(2)">\n\n[bad](javascript:alert(3)) **safe**',
    );
    expect(html).not.toContain("script");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onerror");
    expect(html).toContain("<strong>safe</strong>");
  });

  it("adds a localized copy affordance to fenced code", () => {
    render(
      <ChatMarkdown
        body={"```ts\nconst value = 1;\n```"}
        copyCodeLabel="Copy code"
        copiedCodeLabel="Copied"
        copyFailedLabel="Failed"
      />,
    );
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });
});
