import { useInfiniteCursor } from "@kosmeo-ui/react";
import type { Customer } from "@/types/api";
import { api } from "@/lib/api-client";

const QUERY_KEY = "customers";

/** The key prefix useInfiniteCursor caches every page of the list under. */
export const customersInfiniteQueryKey = [`${QUERY_KEY}-infinite`];

// The library hook owns paging, filters and sort; it only needs the app's
// axios instance and the endpoint.
export const useCustomers = () =>
  useInfiniteCursor<Customer>({
    axiosInstance: api,
    endpoint: "/customers",
    queryKey: QUERY_KEY,
    initialLimit: 25,
  });
