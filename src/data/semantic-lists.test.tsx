import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "./description-list.js";
import { EventItem, EventList, EventTime } from "./event-list.js";

describe("semantic display lists", () => {
  it("keeps native description-list structure", () => {
    const { container } = render(<DescriptionList><DescriptionItem><DescriptionTerm>Revision</DescriptionTerm><DescriptionDetails>abc123</DescriptionDetails></DescriptionItem></DescriptionList>);
    expect(container.querySelector("dl > div > dt + dd")).toHaveTextContent("abc123");
  });

  it("renders events as an ordered list without imposing domain state", () => {
    render(<EventList aria-label="Events"><EventItem title="Run started" timestamp={<EventTime dateTime="2026-07-25">Today</EventTime>}>Details</EventItem></EventList>);
    expect(screen.getByRole("list", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByText("Today").tagName).toBe("TIME");
  });

  it("preserves zero-valued event content", () => {
    const { container } = render(<EventList><EventItem title="Count" metadata={0} actions={0}>{0}</EventItem></EventList>);
    expect(container.querySelector(".ui-event-list__metadata")).toHaveTextContent("0");
    expect(container.querySelector(".ui-event-list__body")).toHaveTextContent("0");
    expect(container.querySelector(".ui-event-list__actions")).toHaveTextContent("0");
  });
});
