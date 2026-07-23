import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthoringGuide, AuthoringHeader } from "../src/index.js";

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
});
