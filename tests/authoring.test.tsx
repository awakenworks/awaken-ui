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
    expect(screen.getByRole("region", { name: "Change review" })).toHaveTextContent("Diff");
    expect(container.firstElementChild).toHaveAttribute("data-rail-position", "end");
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith("review");
  });
});
