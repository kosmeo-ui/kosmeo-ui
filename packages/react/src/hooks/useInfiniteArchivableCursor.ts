"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseInfiniteReturn } from "./useInfinite.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

interface CursorPageResponse<T> {
  data: T[];
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
}

interface UseInfiniteArchivableCursorOptions {
  axiosInstance: AxiosInstance;
  /** API endpoint to fetch from (e.g., "/v1/projects"). */
  endpoint: string;
  /**
   * Query key stem. A string keys the list under `${queryKey}-infinite`; an
   * array keys it under `[...queryKey, "infinite"]`, for apps that invalidate
   * by a multi-segment prefix.
   */
  queryKey: string | (string | null)[];
  /** Organization ID to scope cache keys (prevents stale cross-org data). */
  orgId?: string | null;
  /** Initial page size (default: 25, InfiniteScroll's default). */
  initialLimit?: number;
  enabled?: boolean;
}

/**
 * Cursor-paginated list hook for archivable resources.
 * It behaves like `useInfiniteCursor` — same `-infinite` query
 * key and `UseInfiniteReturn` shape, so existing prefix-matched invalidations
 * keep working — but lifts the "Archived" menu filter out of the generic
 * `filter[...]` bag: InfiniteScroll emits it as `filter[includeArchived]`,
 * whereas the backend reads a top-level `includeArchived` flag.
 */
const useInfiniteArchivableCursor = <T extends { id: number | string }>(
  options: UseInfiniteArchivableCursorOptions
): UseInfiniteReturn<T> => {
  const {
    axiosInstance,
    endpoint,
    queryKey,
    orgId,
    initialLimit = 25,
    enabled = true,
  } = options;

  const [queryString, setQueryString] = useState(`limit=${initialLimit}`);
  const lastQueryRef = useRef(queryString);

  // An array stem nests "infinite" as its own segment so prefix invalidations
  // like `["projects", projectId]` still match; a string keeps the legacy
  // `${queryKey}-infinite` stem.
  const infiniteKey = Array.isArray(queryKey)
    ? [...queryKey, "infinite", orgId ?? null, queryString]
    : [`${queryKey}-infinite`, orgId ?? null, queryString];

  const query = useInfiniteQuery<CursorPageResponse<T>, Error>({
    queryKey: infiniteKey,
    enabled,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.hasMore && last.nextCursor ? last.nextCursor : undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(queryString);
      // Cursor mode never uses offset — strip it if a caller leaks one in.
      params.delete("offset");
      // The "Archived" menu filter arrives as `filter[includeArchived]`, but the
      // backend reads it as a top-level flag (not a filter clause). Lift it out
      // so the default — flag absent — excludes archived rows.
      const archived = params.get("filter[includeArchived]");
      params.delete("filter[includeArchived]");
      params.delete("filter[includeArchived_op]");
      if (archived === "true") params.set("includeArchived", "true");
      if (pageParam) params.set("cursor", pageParam as string);
      const res = await axiosInstance.get<CursorPageResponse<T>>(
        `${endpoint}?${params.toString()}`
      );
      return res.data;
    },
    staleTime: 0,
    gcTime: 0,
  });

  const queryRef = useRef(query);
  queryRef.current = query;

  const onQueryChange = useCallback((newQueryString: string) => {
    const params = new URLSearchParams(newQueryString);
    params.delete("offset");
    const normalized = params.toString();

    // Same filter/sort? InfiniteScroll is asking for the next page. The offset
    // value it passes is meaningless for cursor mode — just fetch the next page.
    if (normalized === lastQueryRef.current) {
      const q = queryRef.current;
      // cancelRefetch: false joins a request already in flight. The default
      // cancels and resends it, and isFetchingNextPage can't stop that: it's
      // read from a render, so two calls in one tick both see it false.
      if (q.hasNextPage) q.fetchNextPage({ cancelRefetch: false });
      return;
    }
    lastQueryRef.current = normalized;
    setQueryString(normalized);
  }, []);

  const reload = useCallback(() => {
    queryRef.current.refetch();
  }, []);

  const [allData, setAllData] = useState<T[]>([]);

  useEffect(() => {
    const pages = query.data?.pages ?? [];
    const flat = pages.flatMap((p) => p.data);
    // Dedup defensively — composite cursors on merged proxies can yield repeats.
    const seen = new Set<string | number>();
    const unique: T[] = [];
    for (const item of flat) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    setAllData(unique);
  }, [query.data]);

  const lastPage = query.data?.pages[query.data.pages.length - 1];
  // After a failure, stop offering pages: reload() retries.
  const hasMore = query.isError
    ? false
    : (lastPage?.hasMore ?? query.hasNextPage ?? false);

  return {
    data: allData,
    hasMore,
    isLoading: query.isLoading,
    isReloading: query.isRefetching && allData.length > 0,
    error: query.error,
    total: 0,
    onQueryChange,
    reload,
  };
};

export default useInfiniteArchivableCursor;
