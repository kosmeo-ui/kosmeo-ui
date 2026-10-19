import { api } from "@/lib/api-client";
import { useState } from "react";
import {
  Badge,
  InfiniteScroll,
  Switch,
  useInfiniteCursor,
  type InfiniteScrollMenu,
  type TableColumn,
} from "@kosmeo-ui/react";

interface Customer {
  id: string;
  name: string;
  company: string;
  status: "active" | "trial" | "churned";
  mrr: number;
}

// Module-level so its identity is stable: InfiniteScroll resets its filters
// whenever `menu` changes.
const menu: InfiniteScrollMenu = {
  title: "InfiniteScroll",
  limitOptions: [
    { value: 5, selected: true },
    { value: 10, selected: false },
  ],
  filters: [
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
    { type: "RANGE", title: "MRR", dataKey: "mrr", rangeType: "NUMBER" },
  ],
  sort: {
    sortDataKeys: [
      { dataKey: "name", displayName: "Name", selected: true },
      { dataKey: "mrr", displayName: "MRR", selected: false },
    ],
    sortDirection: "asc",
  },
};

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
  {
    title: "MRR",
    align: "right",
    width: "7rem",
    cellElement: (c) => `$${c.mrr.toLocaleString()}`,
  },
];

// useInfiniteCursor drives InfiniteScroll against a cursor-paginated endpoint
// through the app's own axios instance (here, the demo's mock API).
// Filters apply as they change by default; applyMode="manual" adds an Apply
// button and waits for it.
export const InfiniteScrollExample = () => {
  const { data, hasMore, isLoading, onQueryChange, reload } =
    useInfiniteCursor<Customer>({
      axiosInstance: api,
      endpoint: "/customers",
      queryKey: "gallery-customers",
      initialLimit: 5,
    });
  const [manual, setManual] = useState(false);

  return (
    <div className="demo-frame demo-frame-tall">
      <Switch
        label='Apply button (applyMode="manual")'
        checked={manual}
        onChange={(e) => setManual(e.target.checked)}
      />
      <InfiniteScroll<Customer>
        menu={menu}
        applyMode={manual ? "manual" : "immediate"}
        columns={columns}
        data={data}
        hasMore={hasMore}
        isLoading={isLoading}
        onQueryChange={onQueryChange}
        onReload={reload}
        hideSelectColumn
      />
    </div>
  );
};
