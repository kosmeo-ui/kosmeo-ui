import DataTable from "../../../data-display/dataTable";
import Checkbox from "../../../inputs/checkbox";
import { type RefObject } from "react";
import {
  TableColumn,
  TableLeadingColumn,
  TableRow,
} from "../../dataTable/types";

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
            />
          ),
          cell: (row) => (
            <Checkbox
              checked={props.selectedRows.has(row.index) || props.allSelected}
              onChange={() => props.onRowSelect(row.index)}
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
