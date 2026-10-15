import { useCustomerColumns } from "../hooks/use-customer-columns";
import { useDeleteCustomers } from "../api/delete-customers";
import { useCustomers } from "../api/get-customers";
import { PLAN_LABELS } from "../utils/labels";
import { downloadCsv } from "../utils/to-csv";
import type { Customer } from "@/types/api";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";
import { useState } from "react";
import {
  ConfirmationModal,
  InfiniteScroll,
  type InfiniteScrollMenu,
  type TableRow,
} from "@kosmeo-ui/react";

const menu: InfiniteScrollMenu = {
  title: "Customers",
  limitOptions: [
    { value: 10, selected: false },
    { value: 25, selected: true },
    { value: 50, selected: false },
  ],
  filters: [
    { type: "SEARCH", title: "Name", dataKey: "name" },
    { type: "SEARCH", title: "Company", dataKey: "company" },
    {
      type: "SELECT",
      title: "Status",
      dataKey: "status",
      multiSelect: true,
      options: [
        { id: "active", name: "Active", selected: false },
        { id: "trial", name: "Trial", selected: false },
        { id: "churned", name: "Churned", selected: false },
      ],
    },
    {
      type: "SELECT",
      title: "Plan",
      dataKey: "plan",
      multiSelect: true,
      options: Object.entries(PLAN_LABELS).map(([id, name]) => ({
        id,
        name,
        selected: false,
      })),
    },
    { type: "RANGE", title: "MRR", dataKey: "mrr", rangeType: "NUMBER" },
    {
      type: "RANGE",
      title: "Signed up",
      dataKey: "signedUp",
      rangeType: "DATE",
    },
  ],
  sort: {
    sortDataKeys: [
      { dataKey: "signedUp", displayName: "Signed up", selected: true },
      { dataKey: "name", displayName: "Name", selected: false },
      { dataKey: "mrr", displayName: "MRR", selected: false },
      { dataKey: "seats", displayName: "Seats", selected: false },
    ],
    sortDirection: "desc",
  },
};

const plural = (n: number) => `${n} customer${n === 1 ? "" : "s"}`;

export const CustomersList = () => {
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<TableRow<Customer>[]>([]);
  const { data, hasMore, isLoading, onQueryChange, reload } = useCustomers();

  const deleteCustomers = useDeleteCustomers({
    mutationConfig: {
      onSuccess: (_, { customerIds }) => {
        toast.success(`Deleted ${plural(customerIds.length)}`);
        setPendingDelete([]);
      },
    },
  });

  const columns = useCustomerColumns();

  return (
    <>
      <InfiniteScroll<Customer>
        menu={menu}
        columns={columns}
        data={data}
        hasMore={hasMore}
        isLoading={isLoading}
        onQueryChange={onQueryChange}
        onReload={reload}
        onRowClick={(c) => navigate(paths.app.customer.getHref(c.id))}
        onAddNew={() => navigate(paths.app.newCustomer.getHref())}
        onDelete={setPendingDelete}
        onDownload={() => downloadCsv(data, "customers.csv")}
        emptyMessage="No customers match these filters"
      />
      <ConfirmationModal
        show={pendingDelete.length > 0}
        title="Delete customers"
        body={`Delete ${plural(pendingDelete.length)}? This can't be undone.`}
        confirmButtonText="Delete"
        handleHide={() => setPendingDelete([])}
        handleConfirm={() =>
          deleteCustomers.mutate({
            customerIds: pendingDelete.map((row) => row.data.id),
          })
        }
        isLoading={deleteCustomers.isPending}
      />
    </>
  );
};
