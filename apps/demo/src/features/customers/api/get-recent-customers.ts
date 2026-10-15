import { queryOptions, useQuery } from "@tanstack/react-query";
import type { CursorPage, Customer } from "@/types/api";
import type { QueryConfig } from "@/lib/react-query";
import { api } from "@/lib/api-client";

export const getRecentCustomers = async ({
  limit,
}: {
  limit: number;
}): Promise<Customer[]> => {
  const res = await api.get<CursorPage<Customer>>("/customers", {
    params: { limit, sort: "signedUp", sortDir: "desc" },
  });
  return res.data.data;
};

export const getRecentCustomersQueryOptions = (limit = 6) =>
  queryOptions({
    queryKey: ["customers", "recent", limit],
    queryFn: () => getRecentCustomers({ limit }),
  });

type UseRecentCustomersOptions = {
  limit?: number;
  queryConfig?: QueryConfig<typeof getRecentCustomersQueryOptions>;
};

export const useRecentCustomers = ({
  limit,
  queryConfig,
}: UseRecentCustomersOptions = {}) =>
  useQuery({ ...getRecentCustomersQueryOptions(limit), ...queryConfig });
