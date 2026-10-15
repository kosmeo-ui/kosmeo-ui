import { useCustomerColumns } from "../hooks/use-customer-columns";
import { useCustomersPage } from "../api/get-customers-page";
import type { CustomerStatus } from "@/types/api";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { useState } from "react";
import {
  Col,
  Input,
  Pagination,
  Row,
  Select,
  Table,
  useDebouncedValue,
} from "@kosmeo-ui/react";

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "churned", label: "Churned" },
];

export const CustomersPagedTable = () => {
  const navigate = useNavigate();
  const columns = useCustomerColumns();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const customers = useCustomersPage({
    name: useDebouncedValue(name, 300),
    status: (status || undefined) as CustomerStatus | undefined,
  });

  return (
    <Col size="md">
      <Row wrap align="end">
        <div className="demo-filter-field">
          <Input
            label="Name"
            placeholder="Search…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onClear={() => setName("")}
          />
        </div>
        <div className="demo-filter-field">
          <Select
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(v) => setStatus(v ?? "")}
          />
        </div>
      </Row>

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
