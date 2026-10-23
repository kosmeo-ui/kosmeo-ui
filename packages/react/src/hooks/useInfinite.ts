"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "axios";

interface InfiniteResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

interface UseInfiniteOptions {
  axiosInstance: AxiosInstance;
  /** The API endpoint to fetch from (e.g., "/buckets/my-bucket/objects") */
  endpoint: string;
  /** The query key for React Query caching */
  queryKey: string;
  /** Organization ID to scope cache keys (prevents stale cross-org data) */
  orgId?: string | null;
  /** Initial limit (default: 25, InfiniteScroll's default page size) */
  initialLimit?: number;
  /** Whether or not the query should be enabled */
  enabled?: boolean;
}

export interface UseInfiniteReturn<T> {
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  isReloading: boolean;
  /** The failed request's error, or null; cleared once a load succeeds. */
  error: Error | null;
  total: number;
  onQueryChange: (queryString: string) => void;
  reload: () => void;
}

const useInfinite = <T extends { id: number | string }>(
  options: UseInfiniteOptions
): UseInfiniteReturn<T> => {
  const {
    axiosInstance,
    endpoint,
    queryKey,
    orgId,
    initialLimit = 25,
  } = options;

  const defaultQuery = `limit=${initialLimit}&offset=0`;
  // Null until the first onQueryChange: fetching the default first would be
  // thrown away when InfiniteScroll applies its menu's sort and filters.
  const [queryString, setQueryString] = useState<string | null>(null);
  const [allData, setAllData] = useState<T[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const isNextPageRef = useRef(false);
  const lastQueryStringRef = useRef<string | null>(null);
  const queryStringRef = useRef(queryString);

  queryStringRef.current = queryString;

  const queryFn = async (): Promise<InfiniteResponse<T>> => {
    const res = await axiosInstance.get(
      `${endpoint}?${queryString ?? defaultQuery}`
    );
    return res.data;
  };

  const query = useQuery({
    queryKey: [`${queryKey}-infinite`, orgId ?? null, queryString, reloadKey],
    queryFn,
    enabled: queryString !== null,
    staleTime: 0,
    gcTime: 0,
  });

  const handleQueryChange = useCallback((newQueryString: string) => {
    if (newQueryString === lastQueryStringRef.current) return;
    lastQueryStringRef.current = newQueryString;

    const params = new URLSearchParams(newQueryString);
    const offset = parseInt(params.get("offset") || "0", 10);

    if (offset === 0) {
      setAllData((prev) => (prev.length > 0 ? [] : prev));
      isNextPageRef.current = false;
    } else {
      isNextPageRef.current = true;
    }

    setQueryString(newQueryString);
  }, []);

  // InfiniteScroll sends its menu's query from an effect, and a child's effects
  // run before this one. Nothing sent one? Load the default page.
  useEffect(() => {
    if (lastQueryStringRef.current === null) handleQueryChange(defaultQuery);
  }, [defaultQuery, handleQueryChange]);

  const reload = useCallback(() => {
    const params = new URLSearchParams(queryStringRef.current ?? defaultQuery);
    params.set("offset", "0");
    const newQueryString = params.toString();

    // Force update even if query string is the same
    lastQueryStringRef.current = "";
    isNextPageRef.current = false;

    setAllData([]);
    setReloadKey((k) => k + 1);
    setQueryString(newQueryString);
  }, [defaultQuery]);

  useEffect(() => {
    if (!query.data) return;

    const newData = query.data.data;
    if (!newData) return;

    if (isNextPageRef.current) {
      setAllData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewData = newData.filter(
          (item) => !existingIds.has(item.id)
        );
        if (uniqueNewData.length === 0) return prev;
        return [...prev, ...uniqueNewData];
      });
      isNextPageRef.current = false;
    } else {
      setAllData((prev) => {
        if (
          prev.length === newData.length &&
          prev.every((item, i) => item.id === newData[i]?.id)
        ) {
          return prev;
        }
        return newData;
      });
    }
  }, [query.data]);

  return {
    data: allData,
    // After a failure, stop offering pages: reload() retries.
    hasMore: query.isError ? false : (query.data?.hasMore ?? true),
    isLoading: query.isLoading || queryString === null,
    isReloading: query.isFetching && allData.length > 0,
    error: query.error,
    total: query.data?.total ?? 0,
    onQueryChange: handleQueryChange,
    reload,
  };
};

export default useInfinite;
