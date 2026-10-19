"use client";

import * as pendingChangesUtil from "../infiniteScroll/utils/hasPendingChanges.js";
import { filterParams } from "../infiniteScroll/utils/generateQueryString.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Filters from "../infiniteScroll/filters/index.js";
import Button from "../../buttons/button/index.js";
import Tags from "../infiniteScroll/tags/index.js";
import Col from "../../layout/col/index.js";
import {
  InfiniteScrollMenuFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../infiniteScroll/types.js";

const TYPING_DEBOUNCE_MS = 400;

export interface TableFiltersProps {
  /**
   * The filters to offer, as in InfiniteScroll's `menu.filters`. They're
   * compared by contents, so an inline array is fine; changing them resets
   * every filter to the new definitions.
   */
  filters: InfiniteScrollMenuFilter[];
  /**
   * Called with the applied filters as query params (`filter[status]`,
   * `filter[mrr_gte]`, …), ready to spread into `usePaginated`'s `params`.
   * It fires once on mount, with `{}` unless a filter starts with a value.
   */
  onChange: (params: Record<string, string>) => void;
  /**
   * `"immediate"` (default) applies each change as it's made: searches wait
   * for a pause in typing, and a range (two bounds in one menu) applies from
   * the menu's own Apply button. `"manual"` collects changes until Apply is
   * clicked. Enter in a filter's text box applies in both.
   */
  applyMode?: "immediate" | "manual";
}

const generate = (filters: InfiniteScrollMenuFilter[]) =>
  filters.map((f, i): InfiniteScrollMenuGeneratedFilter => ({
    ...f,
    filterId: `${f.dataKey}-${i}`,
  }));

/**
 * InfiniteScroll's filter bar on its own, for tables that page or load some
 * other way: search, select, range and list filters with tags and Reset. It
 * reports the applied filters as query params.
 */
const TableFilters = ({
  filters: definitions,
  onChange,
  applyMode = "immediate",
}: TableFiltersProps) => {
  const [filters, setFilters] = useState(() => generate(definitions));
  const [pendingFilters, setPendingFilters] = useState(filters);

  // The definitions are plain data, as InfiniteScroll's menu: start over when
  // their contents change, not each time they're a new array.
  const definitionsKey = JSON.stringify(definitions);
  const [prevDefinitionsKey, setPrevDefinitionsKey] = useState(definitionsKey);
  if (definitionsKey !== prevDefinitionsKey) {
    const next = generate(definitions);
    setPrevDefinitionsKey(definitionsKey);
    setFilters(next);
    setPendingFilters(next);
  }

  // Report only when the params actually change, not on every new array.
  const params = useMemo(() => filterParams(filters), [filters]);
  const paramsKey = JSON.stringify(params);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    onChangeRef.current(params);
  }, [paramsKey]);

  const hasPendingChanges = useMemo(
    () => pendingChangesUtil.hasFilterChanges(filters, pendingFilters),
    [filters, pendingFilters]
  );
  const hasActiveFilters =
    pendingChangesUtil.hasActiveFilters(pendingFilters) ||
    pendingChangesUtil.hasActiveFilters(filters);

  const handleApply = useCallback(
    () => setFilters(pendingFilters),
    [pendingFilters]
  );

  useEffect(() => {
    if (applyMode !== "immediate" || !hasPendingChanges) return;
    const delay = pendingChangesUtil.hasTypedFilterChanges(
      filters,
      pendingFilters
    )
      ? TYPING_DEBOUNCE_MS
      : 0;
    const timer = setTimeout(handleApply, delay);
    return () => clearTimeout(timer);
  }, [applyMode, hasPendingChanges, handleApply, filters, pendingFilters]);

  // Removing a tag applies at once; the pending copy of that filter follows.
  const handleTagChange = useCallback(
    (next: InfiniteScrollMenuGeneratedFilter[]) => {
      setPendingFilters((pending) =>
        pending.map((p, i) => (next[i] !== filters[i] ? next[i] : p))
      );
      setFilters(next);
    },
    [filters]
  );

  const handleReset = useCallback(() => {
    const cleared = pendingChangesUtil.clearFilters(pendingFilters);
    setPendingFilters(cleared);
    setFilters(cleared);
  }, [pendingFilters]);

  return (
    <Col size="sm">
      <Filters
        pendingFilters={pendingFilters}
        handleNewPendingFilters={setPendingFilters}
        onApply={hasPendingChanges ? handleApply : undefined}
        rangeApplyInMenu={applyMode === "immediate"}
      >
        <Button
          size="sm"
          variant="danger"
          disabled={!hasActiveFilters}
          onClick={handleReset}
        >
          Reset
        </Button>
        {applyMode === "manual" && (
          <Button size="sm" disabled={!hasPendingChanges} onClick={handleApply}>
            Apply
          </Button>
        )}
      </Filters>
      <Tags filters={filters} handleNewFilters={handleTagChange} />
    </Col>
  );
};

export default TableFilters;
