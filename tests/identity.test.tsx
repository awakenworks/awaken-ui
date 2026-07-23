import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar, IdentityCard, initialsOf } from "../src/index.js";

describe("identity", () => {
  it("derives compact initials", () => {
    expect(initialsOf("Ada Lovelace")).toBe("AL");
    expect(initialsOf(" Agent ")).toBe("A");
    expect(initialsOf(" ")).toBe("?");
  });

  it("supports a consumer-owned identity mark and action", () => {
    const onActivate = vi.fn();
    render(
      <IdentityCard
        media={<Avatar label="Reviewer"><svg data-testid="mark" /></Avatar>}
        name="Reviewer"
        description="Reviews changes"
        status={<span>Online</span>}
        badges={<span>Agent</span>}
        metadata={<span>Claude</span>}
        onActivate={onActivate}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onActivate).toHaveBeenCalledOnce();
    expect(screen.getByTestId("mark")).toBeInTheDocument();
    expect(screen.getByText("Reviews changes")).toBeInTheDocument();
  });
});
