"use client";

import parseDataKey, { cellText } from "../dataTable/utils/parseDataKey.js";
import type { TableColumn, TableRow } from "../dataTable/types.js";
import handleRowClick from "../dataTable/utils/rowClick.js";
import "./styles.css";
import {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";

export interface TableProps<TData> {
  columns: TableColumn<TData>[];
  rows: TData[];
  /**
   * Stable per-row key. Defaults to `index` — provide this if rows can
   * reorder/insert so React reconciliation is correct.
   */
  rowKey?: (row: TData, index: number) => string | number;
  /**
   * Row click handler, a mouse convenience only: rows can't be focused. Put
   * a `TableCellLink` or `TableCellButton` in the row's primary cell (name,
   * email) so the record is reachable by keyboard. Clicks on a link, button
   * or other control in a cell, and on cells with `disableRowClick` on their
   * column, don't fire this. When set, rows render `cursor: pointer`.
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
                onClick={
                  onRowClick
                    ? (e) => handleRowClick(e, () => onRowClick(row, i))
                    : undefined
                }
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
                      ? cellText(parseDataKey(c.dataKey, row))
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

type TableCellLinkOwnProps<E extends ElementType> = {
  /** Element type used for the link. Pass `Link` from react-router. Defaults to `a`. */
  as?: E;
  children: ReactNode;
};

export type TableCellLinkProps<E extends ElementType = "a"> =
  TableCellLinkOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof TableCellLinkOwnProps<E>>;

/**
 * A link to the row's record, for its primary cell. Keep badges and other
 * extras outside it, so its accessible name is just the record's name.
 */
export const TableCellLink = <E extends ElementType = "a">(
  props: TableCellLinkProps<E>
) => {
  const { as, children, ...rest } = props as {
    as?: ElementType;
    children: ReactNode;
  } & Record<string, unknown>;
  const Component: ElementType = as ?? "a";
  return (
    <Component {...rest} className="k-table-cell-link">
      {children}
    </Component>
  );
};

export type TableCellButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
>;

/** `TableCellLink` for a row that opens a dialog rather than a page. */
export const TableCellButton = (props: TableCellButtonProps) => (
  <button {...props} type="button" className="k-table-cell-link" />
);

export default Table;
export type { TableColumn, TableRow };
