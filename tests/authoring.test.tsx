import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthoringGuide, AuthoringHeader, DesignWorkbench } from "../src/index.js";

describe("authoring chrome", () => {
  it("emits name and window state changes", () => {
    const onNameChange = vi.fn();
    const onWindowedChange = vi.fn();
    render(
      <AuthoringHeader
        backLabel="Back"
        closeLabel="Close"
        identity={<span>Workflow</span>}
        maximizeLabel="Maximize"
        name="Review"
        nameLabel="Name"
        onBack={vi.fn()}
        onClose={vi.fn()}
        onNameChange={onNameChange}
        onWindowedChange={onWindowedChange}
        restoreLabel="Restore"
        windowed
      >
        <span>Publish</span>
      </AuthoringHeader>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Deploy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Maximize" }));
    expect(onNameChange).toHaveBeenCalledWith("Deploy");
    expect(onWindowedChange).toHaveBeenCalledWith(false);
  });

  it("marks the first incomplete guide step current", () => {
    render(
      <AuthoringGuide
        label="Setup"
        onSelect={vi.fn()}
        steps={[
          { key: "name", label: "Name", complete: true },
          { key: "rules", label: "Rules", complete: false },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: /Rules/ })).toHaveClass("is-current");
  });

  it("keeps product state controlled while sharing the design composition", () => {
    // Cause/effect table: R1 selected mode -> matching pressed control and root
    // projection; R2 user selects another mode -> one callback only; R3 rail at
    // end -> presentation attribute only, with all product content unchanged.
    const onModeChange = vi.fn();
    const { container } = render(
      <DesignWorkbench
        editor={<p>Structured editor</p>}
        labels={{
          mode: "Design mode",
          describe: "Describe",
          design: "Design",
          review: "Review",
          rail: "Design assistant",
          editor: "Structured design",
          reviewPanel: "Change review",
        }}
        mode="describe"
        onModeChange={onModeChange}
        rail={<p>Conversation</p>}
        railPosition="end"
        review={<p>Diff</p>}
      />,
    );
    expect(screen.getByRole("button", { name: "Describe" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "Design assistant" })).toHaveTextContent("Conversation");
    expect(screen.getByRole("region", { name: "Structured design" })).toHaveTextContent("Structured editor");
    expect(screen.getByText("Diff").closest("section")).toHaveAttribute("hidden");
    expect(container.firstElementChild).toHaveAttribute("data-rail-position", "end");
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith("review");
  });

  it("keeps editor and test state mounted through review and mode changes", () => {
    // R1 test capability present -> four modes. R2 selection -> only the
    // selected main pane is accessible. R3 return from test/review -> the same
    // unsent editor value survives; no content remount or product side effect.
    const props = {
      labels: { mode: "Mode", describe: "Describe", design: "Design", test: "Test", review: "Review",
        rail: "Assistant", editor: "Editor", testPanel: "Test run", reviewPanel: "Review changes" },
      onModeChange: vi.fn(), rail: <p>Conversation</p>,
      editor: <input aria-label="Draft" defaultValue="Initial" />,
      test: <input aria-label="Test task" defaultValue="Task" />, review: <p>Changes</p>,
    };
    const { rerender } = render(<DesignWorkbench {...props} mode="design" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Draft" }), { target: { value: "Keep my edits" } });
    rerender(<DesignWorkbench {...props} mode="test" />);
    expect(screen.queryByRole("textbox", { name: "Draft" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Test task" })).toHaveValue("Task");
    fireEvent.change(screen.getByRole("textbox", { name: "Test task" }), { target: { value: "Keep my task" } });
    rerender(<DesignWorkbench {...props} mode="review" />);
    expect(screen.getByRole("region", { name: "Review changes" })).toBeVisible();
    rerender(<DesignWorkbench {...props} mode="design" />);
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue("Keep my edits");
    rerender(<DesignWorkbench {...props} mode="test" />);
    expect(screen.getByRole("textbox", { name: "Test task" })).toHaveValue("Keep my task");
  });

  it("omits unavailable tests and collapses only presentation", () => {
    // R4 absent executor -> no Test control, invalid test mode selects Design.
    // R5 rail collapse/expand -> controlled visibility without unmounting chat.
    const { container } = render(<DesignWorkbench mode="test" onModeChange={vi.fn()}
      labels={{ mode: "Mode", describe: "Describe", design: "Design", review: "Review",
        rail: "Assistant", editor: "Editor", reviewPanel: "Changes", showRail: "Show assistant", hideRail: "Hide assistant" }}
      rail={<input aria-label="Message" defaultValue="Unsent" />} editor={<p>Editor</p>} review={<p>Changes</p>} />);
    expect(screen.queryByRole("button", { name: "Test" })).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-mode", "design");
    fireEvent.click(screen.getByRole("button", { name: "Hide assistant" }));
    expect(container.firstElementChild).toHaveAttribute("data-rail-collapsed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Show assistant" }));
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Unsent");
  });

  it.each(["design", "test", "review"] as const)("opens controlled Describe after a collapsed %s without losing inputs", (mode) => {
    // DT-RAIL: R1 non-Describe + collapse -> rail hidden, content mounted;
    // R2 external controlled Describe -> rail visible and aria-expanded true,
    // independent of a mode-bar click; R3 hide while describing -> request
    // Design once instead of an empty Describe; R4 return to prior mode ->
    // prior collapsed preference and both unsent values retained. No domain
    // callbacks, requests, resets or duplicate visibility state are introduced.
    const props = {
      labels: { mode: "Mode", describe: "Describe", design: "Design", test: "Test", review: "Review",
        rail: "Assistant", editor: "Editor", testPanel: "Test run", reviewPanel: "Changes",
        showRail: "Show assistant", hideRail: "Hide assistant" },
      onModeChange: vi.fn(), rail: <input aria-label="Message" defaultValue="Unsent request" />,
      editor: <input aria-label="Draft" defaultValue="Unsent edit" />,
      test: <p>Run</p>, review: <p>Changes</p>,
    };
    const { container, rerender } = render(<DesignWorkbench {...props} mode={mode} />);
    fireEvent.click(screen.getByRole("button", { name: "Hide assistant" }));
    expect(container.firstElementChild).toHaveAttribute("data-rail-collapsed", "true");
    rerender(<DesignWorkbench {...props} mode="describe" />);
    expect(container.firstElementChild).not.toHaveAttribute("data-rail-collapsed");
    expect(screen.getByRole("button", { name: "Hide assistant" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Unsent request");
    fireEvent.click(screen.getByRole("button", { name: "Hide assistant" }));
    expect(props.onModeChange).toHaveBeenCalledExactlyOnceWith("design");
    rerender(<DesignWorkbench {...props} mode="design" />);
    expect(container.firstElementChild).toHaveAttribute("data-rail-collapsed", "true");
    expect(screen.getByRole("textbox", { name: "Draft" })).toHaveValue("Unsent edit");
  });
});
