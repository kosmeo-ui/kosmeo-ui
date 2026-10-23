"use client";

import { TableColumn, TableLeadingColumn, TableRow } from "./types.js";
import parseDataKey, { cellText } from "./utils/parseDataKey.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import handleRowClick from "./utils/rowClick.js";
import { useMemo, type RefObject } from "react";
import "../table/styles.css";
import "./styles.css";

export interface DataTableProps<TData> {
  columns: TableColumn<TData>[];
  rows: TableRow<TData>[];
  /** Optional leading column (used by InfiniteScroll for checkbox). */
  leadingColumn?: TableLeadingColumn<TData>;
  /**
   * Row click handler. Receives the row data. A mouse convenience only: rows
   * can't be focused. Put a `TableCellLink` or `TableCellButton` in the row's
   * primary cell (name, email) so the record is reachable by keyboard. Clicks
   * on a link, button or other control in a cell don't fire this.
   */
  onRowClick?: (data: TData) => void;
  /**
   * Scroll container to virtualize against. When set AND the row count
   * crosses VIRTUALIZATION_THRESHOLD, only visible rows are rendered.
   * Virtualization is strictly opt-in: omit this prop to render all rows.
   */
  scrollParentRef?: RefObject<HTMLElement | null>;
  /** Striped rows. Defaults to true. */
  striped?: boolean;
  /** Bordered cells. Defaults to true. */
  bordered?: boolean;
  /** Hover highlight. Defaults to true. */
  hover?: boolean;
}

// Below this row count the DOM cost is negligible and virtualization's
// layout-thrash overhead isn't worth it. Above it, scrolling starts to
// feel sluggish without windowing.
const VIRTUALIZATION_THRESHOLD = 100;

// Reasonable starting guess for row height. react-virtual measures real
// heights via measureElement, so this only affects the first paint before
// a row has been measured.
const ESTIMATED_ROW_HEIGHT = 56;

// Render extra rows above/below the viewport so fast scrolls don't flash
// blank space before react-virtual catches up.
const OVERSCAN = 8;

const DataTable = <TData extends object>(props: DataTableProps<TData>) => {
  const {
    columns,
    rows,
    leadingColumn,
    onRowClick,
    scrollParentRef,
    striped = true,
    bordered = true,
    hover = true,
  } = props;

  const shouldVirtualize =
    !!scrollParentRef && rows.length > VIRTUALIZATION_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollParentRef?.current ?? null,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN,
    enabled: shouldVirtualize,
  });

  const tableColumns = useMemo(() => {
    const headers = [];
    if (leadingColumn) {
      headers.push(
        <th key="leading" className="k-data-table-leading">
          {leadingColumn.header}
        </th>
      );
    }
    for (const c of columns) {
      if (c.hidden) continue;
      const content = c.headerElement ? c.headerElement(c.title) : c.title;
      const alignClass = c.align ? `k-data-table-align-${c.align}` : "";
      headers.push(
        <th
          key={headers.length}
          className={`k-data-table-header-cell ${alignClass}`.trim()}
          style={{ width: c.width, minWidth: c.minWidth, maxWidth: c.maxWidth }}
        >
          {content}
        </th>
      );
    }
    return headers;
  }, [columns, leadingColumn]);

  const renderRow = (row: TableRow<TData>) => {
    const cells = [];
    if (leadingColumn) {
      const disable = leadingColumn.disableRowClick ?? true;
      cells.push(
        <td
          key="leading"
          className="k-data-table-leading"
          onClick={disable ? (e) => e.stopPropagation() : undefined}
        >
          {leadingColumn.cell(row)}
        </td>
      );
    }
    for (const c of columns) {
      if (c.hidden) continue;
      const alignClass = c.align ? `k-data-table-align-${c.align}` : "";
      const content = c.cellElement
        ? c.cellElement(row.data, row.index)
        : c.dataKey
          ? cellText(parseDataKey(c.dataKey, row.data))
          : undefined;
      cells.push(
        <td
          key={cells.length}
          className={alignClass}
          onClick={c.disableRowClick ? (e) => e.stopPropagation() : undefined}
        >
          {content}
        </td>
      );
    }
    return cells;
  };

  const columnSpan =
    columns.filter((c) => !c.hidden).length + (leadingColumn ? 1 : 0);

  const body = shouldVirtualize
    ? (() => {
        const virtualRows = virtualizer.getVirtualItems();
        const totalSize = virtualizer.getTotalSize();
        const topSpacer = virtualRows[0]?.start ?? 0;
        const bottomSpacer =
          virtualRows.length > 0
            ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
            : 0;

        return (
          <>
            {topSpacer > 0 && (
              <tr aria-hidden="true">
                <td
                  className="k-data-table-spacer"
                  colSpan={columnSpan}
                  style={{ height: topSpacer }}
                />
              </tr>
            )}
            {virtualRows.map((vr) => {
              const row = rows[vr.index];
              return (
                <tr
                  key={row.index}
                  data-index={vr.index}
                  ref={virtualizer.measureElement}
                  className={onRowClick ? "k-data-table-row-clickable" : ""}
                  onClick={
                    onRowClick
                      ? (e) => handleRowClick(e, () => onRowClick(row.data))
                      : undefined
                  }
                >
                  {renderRow(row)}
                </tr>
              );
            })}
            {bottomSpacer > 0 && (
              <tr aria-hidden="true">
                <td
                  className="k-data-table-spacer"
                  colSpan={columnSpan}
                  style={{ height: bottomSpacer }}
                />
              </tr>
            )}
          </>
        );
      })()
    : rows.map((row) => (
        <tr
          key={row.index}
          className={onRowClick ? "k-data-table-row-clickable" : ""}
          onClick={
            onRowClick
              ? (e) => handleRowClick(e, () => onRowClick(row.data))
              : undefined
          }
        >
          {renderRow(row)}
        </tr>
      ));

  const tableClasses = [
    "k-table",
    striped ? "k-table-striped" : "",
    hover ? "k-table-hover" : "",
    bordered ? "k-table-bordered" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table className={tableClasses}>
      <thead>
        <tr>{tableColumns}</tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
};

export default DataTable;
export type { TableColumn, TableRow, TableLeadingColumn } from "./types.js";
