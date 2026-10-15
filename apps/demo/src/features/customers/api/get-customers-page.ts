import type { Customer, CustomerStatus } from "@/types/api";
import { usePaginated } from "@kosmeo-ui/react";
import { api } from "@/lib/api-client";

const QUERY_KEY = "customers";

/** The key prefix usePaginated caches every page under. */
export const customersPagedQueryKey = [`${QUERY_KEY}-paged`];

type CustomersPageFilters = {
  name?: string;
  status?: CustomerStatus;
};

// One page at a time from the same endpoint InfiniteScroll uses, by offset.
// Changing a filter returns to page 1.
export const useCustomersPage = ({ name, status }: CustomersPageFilters) =>
  usePaginated<Customer>({
    axiosInstance: api,
    endpoint: "/customers",
    queryKey: QUERY_KEY,
    initialPageSize: 25,
    params: {
      sort: "signedUp",
      sortDir: "desc",
      ...(name && { "filter[name]": name, "filter[name_op]": "contains" }),
      ...(status && { "filter[status]": status }),
    },
  });
