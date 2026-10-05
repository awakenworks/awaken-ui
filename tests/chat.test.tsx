import { fireEvent, render, screen } from "@testing-library/react";
import {
  ChatApproval,
  ChatComposer,
  ChatMessage,
  ToolCallCard,
  ToolCallGroup,
  aggregateToolCallTone,
  formatChatTime,
  isNearChatBottom,
} from "../src/index.js";

const labels = {
  input: "Input",
  output: "Result",
  inputAriaLabel: "Tool input",
  outputAriaLabel: "Tool result",
};

describe("chat", () => {
  it("supports both product send gestures and guards empty submission", () => {
    const submit = vi.fn();
    const { rerender } = render(
      <ChatComposer
        value="hello"
        onChange={() => undefined}
        onSubmit={submit}
        placeholder="Message"
        ariaLabel="Message"
        sendLabel="Send"
      />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", ctrlKey: true });
    expect(submit).toHaveBeenCalledOnce();

    rerender(
      <ChatComposer
        value="hello"
        onChange={() => undefined}
        onSubmit={submit}
        sendMode="enter"
        placeholder="Message"
        ariaLabel="Message"
        sendLabel="Send"
      />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("renders identity-backed messages and stable local time", () => {
    render(<ChatMessage role="assistant" authorLabel="Reviewer" timestamp="2025-01-01T08:09:00">Tool</ChatMessage>);
    expect(screen.getByLabelText("Reviewer")).toBeInTheDocument();
    expect(formatChatTime("invalid")).toBe("");
  });

  it("aggregates and expands tool calls", () => {
    const calls = [
      { id: "1", name: "read", statusLabel: "Done", tone: "done" as const, output: "ok" },
      { id: "2", name: "write", statusLabel: "Failed", tone: "error" as const },
    ];
    expect(aggregateToolCallTone(calls)).toBe("error");
    render(<ToolCallGroup calls={calls} summaryLabel="2 calls" labels={labels} />);
    expect(screen.getByText("read")).toBeInTheDocument();
  });

  it("keeps long external badges in their own tool-header row", () => {
    // B1 long badge + narrow card -> one contained badge lane after the
    // action/status row; B2 no badge -> no visible empty lane. Exact tool
    // identity and consumer-owned status still render unchanged.
    const { rerender } = render(<ToolCallCard name="read_source" statusLabel="done" tone="done"
      input="{}" labels={labels} badges={<span className="ui-status-pill">MCP · controlled-source-12345678</span>} />);
    expect(screen.getByRole("button", { name: /read_source/ })).toHaveTextContent("MCP · controlled-source-12345678");
    expect(document.querySelector(".ui-chat-tool__badges .ui-status-pill")).toBeInTheDocument();
    rerender(<ToolCallCard name="read_source" statusLabel="done" tone="done" input="{}" labels={labels} />);
    expect(document.querySelector(".ui-chat-tool__badges")).toBeEmptyDOMElement();
  });

  it("delegates approval decisions to the consumer", () => {
    const approve = vi.fn();
    render(
      <ChatApproval
        title="Permission required"
        approveLabel="Allow"
        rejectLabel="Deny"
        onApprove={approve}
        onReject={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Allow" }));
    expect(approve).toHaveBeenCalledOnce();
  });

  it("detects whether streamed content should remain followed", () => {
    expect(isNearChatBottom(900, 1000, 100)).toBe(true);
    expect(isNearChatBottom(500, 1000, 100)).toBe(false);
  });
});
