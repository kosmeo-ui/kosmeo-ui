import { api } from "@/lib/api-client";
import { useState } from "react";
import {
  Badge,
  Col,
  Pagination,
  Table,
  TableFilters,
  usePaginated,
  type InfiniteScrollMenuFilter,
  type TableColumn,
} from "@kosmeo-ui/react";

interface Customer {
  id: string;
  name: string;
  company: string;
  status: "active" | "trial" | "churned";
}

const columns: TableColumn<Customer>[] = [
  { title: "Name", dataKey: "name" },
  { title: "Company", dataKey: "company" },
  {
    title: "Status",
    align: "center",
    width: "7rem",
    cellElement: (c) => (
      <Badge size="sm" subtle>
        {c.status}
      </Badge>
    ),
  },
];

// Same definitions as InfiniteScroll's menu.filters; module-level, as a new
// array resets the filters.
const filters: InfiniteScrollMenuFilter[] = [
  { type: "SEARCH", title: "Name", dataKey: "name" },
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
];

// usePaginated fetches one page at a time from an offset endpoint
// (`limit` + `offset` in, `{ data, total }` out) through the app's axios
// instance, here the demo's mock API.
// TableFilters reports the applied filters as params to spread into it.
export const PagedTable = () => {
  const [filterParams, setFilterParams] = useState<Record<string, string>>({});
  const customers = usePaginated<Customer>({
    axiosInstance: api,
    endpoint: "/customers",
    queryKey: "gallery-customers",
    initialPageSize: 5,
    params: { sort: "name", sortDir: "asc", ...filterParams },
  });

  return (
    <Col size="md">
      <TableFilters filters={filters} onChange={setFilterParams} />
      <Table
        columns={columns}
        rows={customers.data}
        rowKey={(c) => c.id}
        striped
        bordered
        emptyMessage={customers.isLoading ? "Loading…" : "No customers"}
      />
      <Pagination
        page={customers.page}
        pageCount={customers.pageCount}
        onPageChange={customers.setPage}
        total={customers.total}
        pageSize={customers.pageSize}
        pageSizeOptions={[5, 10, 25]}
        onPageSizeChange={customers.setPageSize}
        aria-label="Paged table pages"
      />
    </Col>
  );
};
