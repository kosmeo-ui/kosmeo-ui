"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { AxiosInstance } from "axios";

interface OffsetPageResponse<T> {
  data: T[];
  total: number;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

interface UsePaginatedOptions {
  axiosInstance: AxiosInstance;
  /** API endpoint to fetch from (e.g., "/v1/projects"). It takes `limit` and `offset` and returns `{ data, total }`. */
  endpoint: string;
  /** Query key for React Query caching. */
  queryKey: string;
  /** Organization ID to scope cache keys (prevents stale cross-org data). */
  orgId?: string | null;
  /** Initial page size (default: 10). */
  initialPageSize?: number;
  /** Extra query params such as filters and sort. Changing them returns to page 1. */
  params?: QueryParams;
  enabled?: boolean;
}

export interface UsePaginatedReturn<T> {
  /** The current page's rows. */
  data: T[];
  /** Total matching rows across all pages. */
  total: number;
  /** Current page, starting at 1. */
  page: number;
  pageSize: number;
  pageCount: number;
  setPage: (page: number) => void;
  /** Changes the page size and returns to page 1. */
  setPageSize: (pageSize: number) => void;
  /** True until the first page arrives. */
  isLoading: boolean;
  /** True whenever a page is loading, including after the first. */
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * One page at a time from an offset endpoint (`limit` + `offset` in,
 * `{ data, total }` out), for `Pagination`. The previous page stays on screen
 * while the next one loads. Use `useInfiniteCursor` for `InfiniteScroll`.
 */
const usePaginated = <T>(
  options: UsePaginatedOptions
): UsePaginatedReturn<T> => {
  const {
    axiosInstance,
    endpoint,
    queryKey,
    orgId,
    initialPageSize = 10,
    params,
    enabled = true,
  } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // New filters or sort make the old page number meaningless.
  const paramsKey = JSON.stringify(params ?? {});
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey);
  if (paramsKey !== prevParamsKey) {
    setPrevParamsKey(paramsKey);
    setPage(1);
  }

  const query = useQuery<OffsetPageResponse<T>, Error>({
    queryKey: [`${queryKey}-paged`, orgId ?? null, paramsKey, page, pageSize],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await axiosInstance.get<OffsetPageResponse<T>>(endpoint, {
        params: { ...params, limit: pageSize, offset: (page - 1) * pageSize },
      });
      return res.data;
    },
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Rows deleted from the last page can leave it empty; step back.
  useEffect(() => {
    if (query.data && !query.isPlaceholderData && page > pageCount) {
      setPage(pageCount);
    }
  }, [query.data, query.isPlaceholderData, page, pageCount]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const { refetch } = query;
  const refetchPage = useCallback(() => void refetch(), [refetch]);

  return {
    data: query.data?.data ?? [],
    total,
    page,
    pageSize,
    pageCount,
    setPage,
    setPageSize,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: refetchPage,
  };
};

export default usePaginated;
