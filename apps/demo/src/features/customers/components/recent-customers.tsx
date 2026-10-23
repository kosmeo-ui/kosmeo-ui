import { useRecentCustomers } from "../api/get-recent-customers";
import { PLAN_LABELS, STATUS_VARIANTS } from "../utils/labels";
import { Link, useNavigate } from "react-router";
import type { Customer } from "@/types/api";
import { currency } from "@/utils/format";
import { paths } from "@/config/paths";
import {
  Badge,
  Card,
  EmptyState,
  Table,
  TableCellLink,
  type TableColumn,
} from "@kosmeo-ui/react";

const columns: TableColumn<Customer>[] = [
  {
    title: "Customer",
    cellElement: (c) => (
      <TableCellLink as={Link} to={paths.app.customer.getHref(c.id)}>
        {c.name}
      </TableCellLink>
    ),
  },
  { title: "Company", dataKey: "company" },
  { title: "Plan", width: "8rem", cellElement: (c) => PLAN_LABELS[c.plan] },
  {
    title: "Status",
    width: "7rem",
    align: "center",
    cellElement: (c) => (
      <Badge size="sm" variant={STATUS_VARIANTS[c.status]} subtle>
        {c.status}
      </Badge>
    ),
  },
  {
    title: "MRR",
    width: "7rem",
    align: "right",
    cellElement: (c) => currency(c.mrr),
  },
];

export const RecentCustomers = () => {
  const navigate = useNavigate();
  const recent = useRecentCustomers();

  return (
    <Card header={{ title: "Newest customers" }} padding="none">
      {recent.data && recent.data.length > 0 ? (
        <Table
          columns={columns}
          rows={recent.data}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(paths.app.customer.getHref(c.id))}
          hover
        />
      ) : (
        <EmptyState layout="block">
          {recent.isLoading ? "Loading…" : "No customers yet"}
        </EmptyState>
      )}
    </Card>
  );
};
