import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatCard } from "./stat-card.js";

describe("StatCard", () => {
  it("uses button semantics only for actions", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <StatCard label="Runs" onClick={onClick} tone="success" value={12} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Runs/ }));
    expect(onClick).toHaveBeenCalledOnce();
    rerender(<StatCard label="Runs" value={12} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
