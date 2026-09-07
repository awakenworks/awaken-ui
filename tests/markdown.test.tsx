import { StrictMode } from "react";
import { userEvent } from "@testing-library/user-event";
import { act, render, screen } from "@testing-library/react";
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

  it.each([false, true])("retains one working copy action across rerenders (strict=%s)", async (strict) => {
    // M graph: normal/StrictMode mount x same content/class/labels/new content.
    // M1 every commit retains exactly one reachable action; M2 repeated identical
    // HTML must preserve enhancement DOM; M3 cleanup + setup rebinds new labels;
    // M4 changed/plain content cannot retain a stale action or copied value.
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const view = (body: string, label = "Copy code", className = "") => {
      const content = <ChatMarkdown body={body} copyCodeLabel={label} copiedCodeLabel="Copied" copyFailedLabel="Failed" className={className} />;
      return strict ? <StrictMode>{content}</StrictMode> : content;
    };
    const { rerender } = render(view("```text\nfirst\n```"));
    for (const [body, label, className, expected] of [
      ["```text\nfirst\n```", "Copy code", "", "first\n"],
      ["```text\nfirst\n```", "Copy code", "changed", "first\n"],
      ["```text\nfirst\n```", "复制代码", "changed", "first\n"],
      ["```text\nsecond\n```", "复制代码", "changed", "second\n"],
    ] as const) {
      rerender(view(body, label, className));
      expect(screen.getAllByRole("button")).toHaveLength(1);
      await user.click(screen.getByRole("button", { name: label }));
      expect(write).toHaveBeenLastCalledWith(expected);
    }
    expect(write).toHaveBeenCalledTimes(4);
    rerender(view("plain text"));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });


  it("does not schedule work when a clipboard result arrives after unmount", async () => {
    // M5 clipboard pending x effect disposed -> no detached DOM mutation/timer;
    // ordinary success/failure feedback is owned by the same copy action.
    const user = userEvent.setup();
    let complete!: () => void;
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(() => new Promise<void>(resolve => { complete = resolve; }));
    const { unmount } = render(<ChatMarkdown body={"```text\nvalue\n```"} copyCodeLabel="Copy" copiedCodeLabel="Copied" copyFailedLabel="Failed" />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    vi.useFakeTimers();
    try {
      unmount();
      await act(async () => { complete(); });
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });

});
