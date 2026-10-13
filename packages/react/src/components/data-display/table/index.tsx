"use client";

import type { TableColumn, TableRow } from "../dataTable/types.js";
import parseDataKey from "../dataTable/utils/parseDataKey.js";
import { ReactNode } from "react";
import "./styles.css";

export interface TableProps<TData> {
  columns: TableColumn<TData>[];
  rows: TData[];
  /**
   * Stable per-row key. Defaults to `index` — provide this if rows can
   * reorder/insert so React reconciliation is correct.
   */
  rowKey?: (row: TData, index: number) => string | number;
  /**
   * Row click handler. Cells with `disableRowClick` on their column won't
   * fire this. When set, rows render `cursor: pointer` automatically.
   */
  onRowClick?: (row: TData, index: number) => void;
  /**
   * When provided, matching rows get `data-selected="true"` for selection
   * styling. Combine with `onRowClick` for click-to-select pickers.
   */
  isRowSelected?: (row: TData, index: number) => boolean;
  /** Rendered (as a single full-width cell) when `rows` is empty. */
  emptyMessage?: ReactNode;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  /**
   * Wraps the table in a scrollable container with a sticky header. Pass any
   * CSS length (string) or a number (interpreted as pixels).
   */
  maxHeight?: string | number;
  style?: React.CSSProperties;
}

const Table = <TData,>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isRowSelected,
  emptyMessage,
  striped = true,
  bordered = true,
  hover = true,
  maxHeight,
  style,
}: TableProps<TData>) => {
  const visibleColumns = columns.filter((c) => !c.hidden);
  const clickable = !!onRowClick;

  const tableClasses = [
    "k-table",
    striped ? "k-table-striped" : "",
    hover ? "k-table-hover" : "",
    bordered ? "k-table-bordered" : "",
    clickable ? "k-table-clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const table = (
    <table className={tableClasses} style={maxHeight ? undefined : style}>
      <thead>
        <tr>
          {visibleColumns.map((c, idx) => {
            const alignClass = c.align ? `k-data-table-align-${c.align}` : "";
            const content = c.headerElement
              ? c.headerElement(c.title)
              : c.title;
            return (
              <th
                key={idx}
                className={`k-data-table-header-cell ${alignClass}`.trim()}
                style={{
                  width: c.width,
                  minWidth: c.minWidth,
                  maxWidth: c.maxWidth,
                }}
              >
                {content}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && emptyMessage !== undefined ? (
          <tr>
            <td colSpan={visibleColumns.length}>{emptyMessage}</td>
          </tr>
        ) : (
          rows.map((row, i) => {
            const key = rowKey ? rowKey(row, i) : i;
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                data-selected={
                  isRowSelected && isRowSelected(row, i) ? "true" : undefined
                }
              >
                {visibleColumns.map((c, ci) => {
                  const alignClass = c.align
                    ? `k-data-table-align-${c.align}`
                    : "";
                  const content = c.cellElement
                    ? c.cellElement(row, i)
                    : c.dataKey
                      ? (parseDataKey(c.dataKey, row) as ReactNode)
                      : null;
                  return (
                    <td
                      key={ci}
                      className={alignClass || undefined}
                      onClick={
                        c.disableRowClick
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  if (maxHeight === undefined) {
    return table;
  }

  const resolvedMaxHeight =
    typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <div
      className="k-table-scroll-container"
      style={{ maxHeight: resolvedMaxHeight, ...style }}
    >
      {table}
    </div>
  );
};

export default Table;
export type { TableColumn, TableRow };
