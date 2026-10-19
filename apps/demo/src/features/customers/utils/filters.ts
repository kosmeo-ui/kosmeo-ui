import type { InfiniteScrollMenuFilter } from "@kosmeo-ui/react";
import { PLAN_LABELS } from "./labels";

// Shared by the infinite-scroll list and the paged table, so both offer the
// same filters.
export const CUSTOMER_FILTERS: InfiniteScrollMenuFilter[] = [
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
];
