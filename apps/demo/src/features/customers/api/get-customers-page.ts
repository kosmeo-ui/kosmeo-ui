import { usePaginated } from "@kosmeo-ui/react";
import type { Customer } from "@/types/api";
import { api } from "@/lib/api-client";

const QUERY_KEY = "customers";

/** The key prefix usePaginated caches every page under. */
export const customersPagedQueryKey = [`${QUERY_KEY}-paged`];

// One page at a time from the same endpoint InfiniteScroll uses, by offset.
// `filters` are the `filter[...]` params TableFilters reports; changing them
// returns to page 1.
export const useCustomersPage = (filters: Record<string, string>) =>
  usePaginated<Customer>({
    axiosInstance: api,
    endpoint: "/customers",
    queryKey: QUERY_KEY,
    initialPageSize: 25,
    params: { sort: "signedUp", sortDir: "desc", ...filters },
  });
