"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseInfiniteReturn } from "./useInfinite.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

interface CursorPageResponse<T> {
  data: T[];
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
}

interface UseInfiniteCursorOptions {
  axiosInstance: AxiosInstance;
  /** API endpoint to fetch from (e.g., "/v1/projects"). */
  endpoint: string;
  /** Query key for React Query caching. */
  queryKey: string;
  /** Organization ID to scope cache keys (prevents stale cross-org data). */
  orgId?: string | null;
  /** Initial page size (default: 10). */
  initialLimit?: number;
  enabled?: boolean;
}

/**
 * Cursor-paginated counterpart to `useInfinite`. Returns the same
 * `UseInfiniteReturn` shape so it's a drop-in replacement for callers that
 * have migrated their backend list endpoint to cursor pagination
 * (`{ data, hasMore, limit, nextCursor }`).
 *
 * `total` is always 0 — cursor endpoints intentionally do not expose `COUNT(*)`.
 */
const useInfiniteCursor = <T extends { id: number | string }>(
  options: UseInfiniteCursorOptions
): UseInfiniteReturn<T> => {
  const {
    axiosInstance,
    endpoint,
    queryKey,
    orgId,
    initialLimit = 10,
    enabled = true,
  } = options;

  const [queryString, setQueryString] = useState(`limit=${initialLimit}`);
  const lastQueryRef = useRef(queryString);

  const query = useInfiniteQuery<CursorPageResponse<T>, Error>({
    queryKey: [`${queryKey}-infinite`, orgId ?? null, queryString],
    enabled,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.hasMore && last.nextCursor ? last.nextCursor : undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(queryString);
      // Cursor mode never uses offset — strip it if a caller leaks one in.
      params.delete("offset");
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
    // value it passes is meaningless for cursor mode — just trigger fetchNextPage.
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
  const hasMore = lastPage?.hasMore ?? query.hasNextPage ?? false;

  return {
    data: allData,
    hasMore,
    isLoading: query.isLoading,
    isReloading: query.isRefetching && allData.length > 0,
    total: 0,
    onQueryChange,
    reload,
  };
};

export default useInfiniteCursor;
