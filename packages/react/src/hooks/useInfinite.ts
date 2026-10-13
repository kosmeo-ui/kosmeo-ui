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
  /** Initial limit (default: 10) */
  initialLimit?: number;
  /** Whether or not the query should be enabled */
  enabled?: boolean;
}

export interface UseInfiniteReturn<T> {
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  isReloading: boolean;
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
    initialLimit = 10,
  } = options;

  const [queryString, setQueryString] = useState(
    `limit=${initialLimit}&offset=0`
  );
  const [allData, setAllData] = useState<T[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const isNextPageRef = useRef(false);
  const lastQueryStringRef = useRef(queryString);
  const queryStringRef = useRef(queryString);

  // Keep ref in sync with state
  queryStringRef.current = queryString;

  const queryFn = async (): Promise<InfiniteResponse<T>> => {
    const res = await axiosInstance.get(`${endpoint}?${queryString}`);
    return res.data;
  };

  const query = useQuery({
    queryKey: [`${queryKey}-infinite`, orgId ?? null, queryString, reloadKey],
    queryFn,
    staleTime: 0,
    gcTime: 0,
  });

  // Handle query change from InfiniteScroll
  const handleQueryChange = useCallback((newQueryString: string) => {
    // Prevent unnecessary updates if query string hasn't changed
    if (newQueryString === lastQueryStringRef.current) return;
    lastQueryStringRef.current = newQueryString;

    const params = new URLSearchParams(newQueryString);
    const offset = parseInt(params.get("offset") || "0", 10);

    if (offset === 0) {
      // Fresh fetch - reset data only if we have data
      setAllData((prev) => (prev.length > 0 ? [] : prev));
      isNextPageRef.current = false;
    } else {
      // Next page fetch
      isNextPageRef.current = true;
    }

    setQueryString(newQueryString);
  }, []);

  // Reload from the beginning (reset offset to 0)
  const reload = useCallback(() => {
    const params = new URLSearchParams(queryStringRef.current);
    params.set("offset", "0");
    const newQueryString = params.toString();

    // Force update even if query string is the same
    lastQueryStringRef.current = "";
    isNextPageRef.current = false;

    setAllData([]);
    setReloadKey((k) => k + 1);
    setQueryString(newQueryString);
  }, []);

  // Merge data when query succeeds
  useEffect(() => {
    if (!query.data) return;

    const newData = query.data.data;
    if (!newData) return;

    if (isNextPageRef.current) {
      // Append new data for next page
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
      // Replace data for fresh fetch - only update if different
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
    hasMore: query.data?.hasMore ?? true,
    isLoading: query.isLoading,
    isReloading: query.isFetching && allData.length > 0,
    total: query.data?.total ?? 0,
    onQueryChange: handleQueryChange,
    reload,
  };
};

export default useInfinite;
