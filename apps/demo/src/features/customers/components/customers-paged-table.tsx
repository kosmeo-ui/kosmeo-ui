import { Col, Pagination, Table, TableFilters } from "@kosmeo-ui/react";
import { useCustomerColumns } from "../hooks/use-customer-columns";
import { useCustomersPage } from "../api/get-customers-page";
import { CUSTOMER_FILTERS } from "../utils/filters";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { useState } from "react";

// TableFilters is InfiniteScroll's filter bar on its own: the same filters,
// tags and Reset, reported as params for usePaginated.
export const CustomersPagedTable = () => {
  const navigate = useNavigate();
  const columns = useCustomerColumns();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const customers = useCustomersPage(filters);

  return (
    <Col size="md">
      <TableFilters filters={CUSTOMER_FILTERS} onChange={setFilters} />

      {/* The previous page stays visible, dimmed, while the next one loads. */}
      <div
        className={customers.isFetching ? "demo-loading" : undefined}
        aria-busy={customers.isFetching}
      >
        <Table
          columns={columns}
          rows={customers.data}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(paths.app.customer.getHref(c.id))}
          striped
          bordered
          hover
          emptyMessage={
            customers.isLoading
              ? "Loading…"
              : "No customers match these filters"
          }
        />
      </div>

      <Pagination
        page={customers.page}
        pageCount={customers.pageCount}
        onPageChange={customers.setPage}
        total={customers.total}
        pageSize={customers.pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={customers.setPageSize}
        aria-label="Customer pages"
      />
    </Col>
  );
};
