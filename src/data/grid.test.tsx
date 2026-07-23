import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid } from "./grid.js";

describe("DataGrid", () => {
  it("filters, sorts, and pages through consumer-owned state", () => {
    const setSort = vi.fn();
    render(
      <DataGrid
        columns={[
          { key: "name", header: "Name", cell: (row) => row.name, sortValue: (row) => row.name },
        ]}
        filter={(row, query) => row.name.includes(query)}
        labels={{
          searchPlaceholder: "Filter",
          previous: "Previous",
          next: "Next",
          formatRange: ({ total }) => `${total} rows`,
        }}
        renderEmpty={() => "Empty"}
        renderLoading={() => <tbody />}
        rowKey={(row) => row.name}
        rows={[{ name: "Beta" }, { name: "Alpha" }]}
        state={{
          q: "a",
          sort: "name",
          dir: "asc",
          page: 1,
          setPage: vi.fn(),
          setQ: vi.fn(),
          setSort,
        }}
      />,
    );
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Alpha");
    fireEvent.click(screen.getByRole("columnheader", { name: /Name/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });
});
