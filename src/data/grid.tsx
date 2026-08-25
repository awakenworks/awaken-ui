import type { ReactNode } from "react";
import { cx } from "../internal/cx.js";

export interface DataGridColumn<Row> {
  readonly key: string;
  readonly header: ReactNode;
  readonly cell: (row: Row) => ReactNode;
  readonly sortValue?: (row: Row) => string | number;
  readonly align?: "left" | "right";
  readonly width?: number | string;
}

export interface DataGridState {
  readonly q: string;
  readonly sort: string;
  readonly dir: "asc" | "desc";
  readonly page: number;
  readonly setQ: (value: string) => void;
  readonly setSort: (key: string) => void;
  readonly setPage: (page: number) => void;
}

export interface DataGridLabels {
  readonly searchPlaceholder: string;
  readonly previous: ReactNode;
  readonly next: ReactNode;
  readonly formatRange: (range: {
    readonly from: number;
    readonly to: number;
    readonly total: number;
  }) => ReactNode;
}

export interface DataGridClasses {
  readonly toolbar?: string;
  readonly toolbarLead?: string;
  readonly search?: string;
  readonly range?: string;
  readonly scroll?: string;
  readonly table?: string;
  readonly muted?: string;
  readonly pager?: string;
  readonly button?: string;
}

export interface DataGridProps<Row> {
  readonly rows: readonly Row[];
  readonly columns: readonly DataGridColumn<Row>[];
  readonly rowKey: (row: Row) => string;
  readonly state: DataGridState;
  readonly labels: DataGridLabels;
  readonly filter?: (row: Row, query: string) => boolean;
  readonly onRowClick?: (row: Row) => void;
  readonly pageSize?: number;
  readonly loading?: boolean;
  readonly toolbar?: ReactNode;
  /** Render a label-value card view below 760px while retaining the native table
   * for wider viewports. Products opt in after checking their cell content. */
  readonly mobileCards?: boolean;
  /** Accessible label for the per-card action when `onRowClick` is present. */
  readonly mobileRowActionLabel?: ReactNode | ((row: Row) => ReactNode);
  readonly renderMobileLoading?: () => ReactNode;
  readonly renderLoading: (columns: number) => ReactNode;
  readonly renderEmpty: () => ReactNode;
  readonly classes?: DataGridClasses;
}

export function DataGrid<Row>({
  rows,
  columns,
  rowKey,
  state,
  labels,
  filter,
  onRowClick,
  pageSize = 20,
  loading = false,
  toolbar,
  mobileCards = false,
  mobileRowActionLabel,
  renderMobileLoading,
  renderLoading,
  renderEmpty,
  classes,
}: DataGridProps<Row>) {
  const filtered = filter && state.q
    ? rows.filter((row) => filter(row, state.q))
    : rows;
  const sortColumn = columns.find(
    (column) => column.key === state.sort && column.sortValue,
  );
  const sorted = sortColumn
    ? [...filtered].sort((a, b) => {
        const aValue = sortColumn.sortValue?.(a);
        const bValue = sortColumn.sortValue?.(b);
        const comparison =
          typeof aValue === "number" && typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue));
        return state.dir === "asc" ? comparison : -comparison;
      })
    : filtered;
  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(state.page, pages);
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  return (
    <>
      <div className={cx("ui-data-grid__toolbar", classes?.toolbar)}>
        <div className={cx("ui-data-grid__toolbar-lead", classes?.toolbarLead)}>
          {filter ? (
            <input
              className={cx("ui-data-grid__search", classes?.search)}
              placeholder={labels.searchPlaceholder}
              value={state.q}
              onChange={(event) => state.setQ(event.target.value)}
            />
          ) : null}
          {toolbar}
        </div>
        <span className={cx("ui-data-grid__range", classes?.range)}>
          {total === 0 ? null : labels.formatRange({
            from: (page - 1) * pageSize + 1,
            to: Math.min(page * pageSize, total),
            total,
          })}
        </span>
      </div>
      <div
        className={cx("ui-data-grid__scroll", classes?.scroll)}
        data-mobile-cards={mobileCards ? "true" : undefined}
      >
        <table className={classes?.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    cursor: column.sortValue ? "pointer" : "default",
                    textAlign: column.align ?? "left",
                    width: column.width,
                  }}
                  onClick={() => {
                    if (column.sortValue) state.setSort(column.key);
                  }}
                >
                  {column.header}
                  {column.sortValue && state.sort === column.key ? (
                    <span className={classes?.muted}>
                      {" "}{state.dir === "asc" ? "▲" : "▼"}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          {loading ? renderLoading(columns.length) : (
            <tbody>
              {pageRows.map((row) => (
                <tr
                  data-click={onRowClick ? "true" : undefined}
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={{ textAlign: column.align ?? "left" }}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 ? (
                <tr><td className="ui-data-grid__empty" colSpan={columns.length}>{renderEmpty()}</td></tr>
              ) : null}
            </tbody>
          )}
        </table>
      </div>
      {mobileCards ? (
        <div className="ui-data-grid__cards">
          {loading ? renderMobileLoading?.() : (
            <>
              {pageRows.map((row) => (
                <article className="ui-data-grid__card" key={rowKey(row)}>
                  <dl className="ui-data-grid__card-fields">
                    {columns.map((column) => (
                      <div className="ui-data-grid__card-field" key={column.key}>
                        <dt>{column.header}</dt>
                        <dd style={{ textAlign: column.align ?? "left" }}>{column.cell(row)}</dd>
                      </div>
                    ))}
                  </dl>
                  {onRowClick && mobileRowActionLabel ? (
                    <button
                      className={classes?.button}
                      onClick={() => onRowClick(row)}
                      type="button"
                    >
                      {typeof mobileRowActionLabel === "function"
                        ? mobileRowActionLabel(row)
                        : mobileRowActionLabel}
                    </button>
                  ) : null}
                </article>
              ))}
              {pageRows.length === 0 ? renderEmpty() : null}
            </>
          )}
        </div>
      ) : null}
      {pages > 1 ? (
        <div className={cx("ui-data-grid__pager", classes?.pager)}>
          <button className={classes?.button} disabled={page <= 1}
            onClick={() => state.setPage(page - 1)} type="button">
            {labels.previous}
          </button>
          <span className={classes?.muted}>{page} / {pages}</span>
          <button className={classes?.button} disabled={page >= pages}
            onClick={() => state.setPage(page + 1)} type="button">
            {labels.next}
          </button>
        </div>
      ) : null}
    </>
  );
}
