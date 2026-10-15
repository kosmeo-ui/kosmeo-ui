import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import type { Stats } from "@/types/api";
import { api } from "@/lib/api-client";

export const getStats = async (): Promise<Stats> => {
  const res = await api.get<Stats>("/stats");
  return res.data;
};

// Customers change in another feature, which can't invalidate this query, so
// the dashboard always refetches on mount instead.
export const getStatsQueryOptions = () =>
  queryOptions({ queryKey: ["stats"], queryFn: getStats, staleTime: 0 });

type UseStatsOptions = {
  queryConfig?: QueryConfig<typeof getStatsQueryOptions>;
};

export const useStats = ({ queryConfig }: UseStatsOptions = {}) =>
  useQuery({ ...getStatsQueryOptions(), ...queryConfig });
