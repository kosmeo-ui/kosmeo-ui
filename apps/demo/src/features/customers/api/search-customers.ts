import { queryOptions, useQuery } from "@tanstack/react-query";
import type { CursorPage, Customer } from "@/types/api";
import { useDebouncedValue } from "@kosmeo-ui/react";
import { api } from "@/lib/api-client";

export const searchCustomers = async ({
  term,
  field,
  limit,
}: {
  term: string;
  field: string;
  limit: number;
}): Promise<Customer[]> => {
  const params: Record<string, string | number> = { limit };
  if (term) {
    params[`filter[${field}]`] = term;
    params[`filter[${field}_op]`] = "contains";
  }
  const res = await api.get<CursorPage<Customer>>("/customers", { params });
  return res.data.data;
};

export const searchCustomersQueryOptions = (
  term: string,
  field: string,
  limit: number
) =>
  queryOptions({
    queryKey: ["customers", "search", field, term, limit],
    queryFn: () => searchCustomers({ term, field, limit }),
  });

/** Shaped as SearchList's `queryFn`, which it calls on every render. */
export const useSearchCustomers = (
  input: string,
  field: string,
  limit: number
) => {
  const term = useDebouncedValue(input, 200);
  return useQuery(searchCustomersQueryOptions(term, field, limit));
};
