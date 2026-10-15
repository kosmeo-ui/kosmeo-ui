"use client";

import DataTable from "../../../data-display/dataTable/index.js";
import Checkbox from "../../../inputs/checkbox/index.js";
import { type RefObject } from "react";
import {
  TableColumn,
  TableLeadingColumn,
  TableRow,
} from "../../dataTable/types.js";

interface InfiniteScrollTableProps<TData> {
  columns: TableColumn<TData>[];
  rows: TableRow<TData>[];
  selectedRows: Set<number>;
  allSelected: boolean;
  onRowSelect: (data: number) => void;
  onSelectAll: () => void;
  onRowClick?: (data: TData) => void;
  hideSelectColumn?: boolean;
  scrollParentRef?: RefObject<HTMLElement | null>;
}

const InfiniteScrollTable = <TData extends object>(
  props: InfiniteScrollTableProps<TData>
) => {
  const leadingColumn: TableLeadingColumn<TData> | undefined =
    props.hideSelectColumn
      ? undefined
      : {
          header: (
            <Checkbox
              checked={props.allSelected}
              onChange={props.onSelectAll}
              aria-label="Select all rows"
            />
          ),
          cell: (row) => (
            <Checkbox
              checked={props.selectedRows.has(row.index) || props.allSelected}
              onChange={() => props.onRowSelect(row.index)}
              aria-label={`Select row ${row.index + 1}`}
            />
          ),
        };

  return (
    <DataTable<TData>
      columns={props.columns}
      rows={props.rows}
      leadingColumn={leadingColumn}
      onRowClick={props.onRowClick}
      scrollParentRef={props.scrollParentRef}
    />
  );
};

export default InfiniteScrollTable;
