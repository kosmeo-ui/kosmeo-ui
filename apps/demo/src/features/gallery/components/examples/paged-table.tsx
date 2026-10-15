import { api } from "@/lib/api-client";
import {
  Badge,
  Col,
  Pagination,
  Table,
  usePaginated,
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

// usePaginated fetches one page at a time from an offset endpoint
// (`limit` + `offset` in, `{ data, total }` out) through the app's axios
// instance, here the demo's mock API.
export const PagedTable = () => {
  const customers = usePaginated<Customer>({
    axiosInstance: api,
    endpoint: "/customers",
    queryKey: "gallery-customers",
    initialPageSize: 5,
    params: { sort: "name", sortDir: "asc" },
  });

  return (
    <Col size="md">
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
