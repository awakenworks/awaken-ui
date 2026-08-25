import { fireEvent, render, screen, within } from "@testing-library/react";
import { DataGrid, type DataGridState } from "../src/index.js";

const state: DataGridState = {
  q: "",
  sort: "name",
  dir: "asc",
  page: 1,
  setQ: vi.fn(),
  setSort: vi.fn(),
  setPage: vi.fn(),
};

describe("DataGrid mobile cards", () => {
  it("retains the data table and adds a semantic mobile card action", () => {
    const open = vi.fn();
    render(
      <DataGrid
        rows={[{ id: "one", name: "Readable name", status: "ready" }]}
        columns={[
          { key: "name", header: "Name", cell: (row) => row.name, sortValue: (row) => row.name },
          { key: "status", header: "Status", cell: (row) => row.status },
        ]}
        rowKey={(row) => row.id}
        state={state}
        labels={{
          searchPlaceholder: "Filter",
          previous: "Previous",
          next: "Next",
          formatRange: ({ from, to, total }) => `${from}-${to} of ${total}`,
        }}
        mobileCards
        mobileRowActionLabel="Open record"
        onRowClick={open}
        renderEmpty={() => <p>No records</p>}
        renderLoading={() => <tbody />}
      />,
    );

    expect(screen.getByRole("table")).toHaveTextContent("Readable name");
    const article = screen.getByRole("article");
    expect(within(article).getByText("Name").tagName).toBe("DT");
    expect(within(article).getByText("Readable name").tagName).toBe("DD");
    fireEvent.click(within(article).getByRole("button", { name: "Open record" }));
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: "one" }));
  });

  it("does not duplicate a mobile presentation unless the consumer opts in", () => {
    render(
      <DataGrid
        rows={[] as Array<{ id: string }>}
        columns={[{ key: "id", header: "ID", cell: (row) => row.id }]}
        rowKey={(row) => row.id}
        state={state}
        labels={{ searchPlaceholder: "Filter", previous: "Previous", next: "Next", formatRange: () => "" }}
        renderEmpty={() => <p>No records</p>}
        renderLoading={() => <tbody />}
      />,
    );
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(document.querySelector(".ui-data-grid__cards")).not.toBeInTheDocument();
  });
});
