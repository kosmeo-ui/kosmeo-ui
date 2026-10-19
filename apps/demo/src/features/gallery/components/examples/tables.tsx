import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useState } from "react";
import {
  Badge,
  Checkbox,
  DataTable,
  IconButton,
  RowActions,
  Table,
  type TableColumn,
} from "@kosmeo-ui/react";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: "paid" | "overdue";
}

const INVOICES: Invoice[] = [
  { id: "INV-2041", customer: "Northwind Labs", amount: 1280, status: "paid" },
  { id: "INV-2040", customer: "Globex Group", amount: 640, status: "overdue" },
  { id: "INV-2039", customer: "Initech Co.", amount: 2210, status: "paid" },
  { id: "INV-2038", customer: "Hooli Systems", amount: 95, status: "paid" },
];

const columns: TableColumn<Invoice>[] = [
  { title: "Invoice", dataKey: "id", width: "15%" },
  { title: "Customer", dataKey: "customer" },
  {
    title: "Amount",
    align: "right",
    width: "15%",
    cellElement: (inv) => `$${inv.amount.toLocaleString()}`,
  },
  {
    title: "Status",
    align: "center",
    width: "15%",
    cellElement: (inv) => (
      <Badge
        size="sm"
        variant={inv.status === "paid" ? "success" : "danger"}
        subtle
      >
        {inv.status}
      </Badge>
    ),
  },
  {
    title: "Actions",
    align: "right",
    width: "8rem",
    disableRowClick: true,
    cellElement: (inv) => (
      <RowActions align="end" gap="xs">
        <IconButton
          icon={faPen}
          size="sm"
          variant="light"
          aria-label="Edit"
          onClick={() => toast(`Edit ${inv.id}`)}
        />
        <IconButton
          icon={faTrash}
          size="sm"
          variant="light"
          aria-label="Delete"
          onClick={() => toast(`Delete ${inv.id}`)}
        />
      </RowActions>
    ),
  },
];

export const Tables = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <>
      <h3>Table: click a row to select it</h3>
      <Table
        columns={columns}
        rows={INVOICES}
        rowKey={(inv) => inv.id}
        onRowClick={(inv) => setSelectedId(inv.id)}
        isRowSelected={(inv) => inv.id === selectedId}
        striped
        bordered
        hover
      />
      <h3>DataTable with a leading checkbox column</h3>
      <DataTable
        columns={columns}
        rows={INVOICES.map((data, index) => ({ index, data }))}
        leadingColumn={{
          header: (
            <Checkbox
              checked={checked.size === INVOICES.length}
              onChange={() =>
                setChecked(
                  checked.size === INVOICES.length
                    ? new Set()
                    : new Set(INVOICES.map((_, i) => i))
                )
              }
              aria-label="Select all invoices"
            />
          ),
          cell: (row) => (
            <Checkbox
              checked={checked.has(row.index)}
              onChange={() => toggle(row.index)}
              aria-label={`Select ${row.data.id}`}
            />
          ),
        }}
      />
      <Table
        columns={columns}
        rows={[]}
        emptyMessage="Table with no rows shows emptyMessage"
      />
    </>
  );
};
