import {
  InfiniteScrollMenuGeneratedFilter,
  InfiniteScrollMenuLimitOption,
  InfiniteScrollMenuSortDataKey,
  RangeValue,
  SortDirection,
} from "../types.js";

interface PendingChangesParams {
  filters: InfiniteScrollMenuGeneratedFilter[];
  pendingFilters: InfiniteScrollMenuGeneratedFilter[];
  sortBy: InfiniteScrollMenuSortDataKey[];
  pendingSortBy: InfiniteScrollMenuSortDataKey[];
  sortDirection: SortDirection;
  pendingSortDirection: SortDirection;
  limitOptions: InfiniteScrollMenuLimitOption[];
  pendingLimitOptions: InfiniteScrollMenuLimitOption[];
}

export const hasPendingChanges = (params: PendingChangesParams): boolean => {
  return (
    hasFilterChanges(params.filters, params.pendingFilters) ||
    hasSortChanges(
      params.sortBy,
      params.pendingSortBy,
      params.sortDirection,
      params.pendingSortDirection
    ) ||
    hasLimitChanges(params.limitOptions, params.pendingLimitOptions)
  );
};

/** A range bound is set unless it's missing or empty; `0` is a real bound. */
export const hasRangeValue = (
  value: RangeValue | undefined
): value is RangeValue => value !== undefined && value !== "";

export const hasActiveFilters = (
  pendingFilters: InfiniteScrollMenuGeneratedFilter[]
): boolean => {
  for (const filter of pendingFilters) {
    if (filter.type === "RANGE") {
      if (hasRangeValue(filter.startValue) || hasRangeValue(filter.endValue))
        return true;
    } else if (filter.type === "SEARCH") {
      if (filter.value) return true;
    } else if (filter.type === "LIST") {
      if (filter.list) return true;
    } else if (filter.type === "SELECT") {
      if (filter.options?.some((o) => o.selected)) return true;
    }
  }
  return false;
};

/** The filters with every value cleared, for Reset. */
export const clearFilters = (
  filters: InfiniteScrollMenuGeneratedFilter[]
): InfiniteScrollMenuGeneratedFilter[] =>
  filters.map((filter) => {
    if (filter.type === "SELECT") {
      return {
        ...filter,
        options: filter.options?.map((o) => ({ ...o, selected: false })),
      };
    } else if (filter.type === "RANGE") {
      return { ...filter, startValue: undefined, endValue: undefined };
    } else if (filter.type === "SEARCH") {
      return { ...filter, value: undefined };
    } else return { ...filter, list: "" };
  });

/**
 * Whether a pending change is in a search box: applied immediately, searches
 * wait for a pause in typing. (Ranges apply from their menu's Apply button.)
 */
export const hasTypedFilterChanges = (
  filters: InfiniteScrollMenuGeneratedFilter[],
  pendingFilters: InfiniteScrollMenuGeneratedFilter[]
): boolean =>
  filters.some(
    (filter, i) =>
      filter.type === "SEARCH" &&
      hasFilterChanges([filter], [pendingFilters[i]])
  );

// An emptied field is "" and an untouched one undefined; both mean unset.
const isSameValue = (a: unknown, b: unknown) =>
  a === b || ((a === "" || a === undefined) && (b === "" || b === undefined));

export const hasFilterChanges = (
  filters: InfiniteScrollMenuGeneratedFilter[],
  pendingFilters: InfiniteScrollMenuGeneratedFilter[]
): boolean => {
  if (!filters || !pendingFilters) return false;

  for (const filter of filters) {
    const pending = pendingFilters[filters.indexOf(filter)];
    if (!pending) return true;

    if (filter.type === "SELECT" && pending.type === "SELECT") {
      const selected = filter.options?.filter((o) => o.selected) || [];
      const pendingSelected = pending.options?.filter((o) => o.selected) || [];
      if (selected.length !== pendingSelected.length) return true;
      if (!selected.every((o) => pendingSelected.some((p) => p.id === o.id)))
        return true;
    } else if (filter.type === "SEARCH" && pending.type === "SEARCH") {
      if (!isSameValue(filter.value, pending.value)) return true;
    } else if (filter.type === "RANGE" && pending.type === "RANGE") {
      if (!isSameValue(filter.startValue, pending.startValue)) return true;
      if (!isSameValue(filter.endValue, pending.endValue)) return true;
    } else if (filter.type === "LIST" && pending.type === "LIST") {
      if (!isSameValue(filter.list, pending.list)) return true;
    }
  }
  return false;
};

const hasSortChanges = (
  sortBy: InfiniteScrollMenuSortDataKey[],
  pendingSortBy: InfiniteScrollMenuSortDataKey[],
  sortDirection: SortDirection,
  pendingSortDirection: SortDirection
): boolean => {
  if (sortDirection !== pendingSortDirection) return true;

  const currentSelected = sortBy.find((s) => s.selected);
  const pendingSelected = pendingSortBy.find((s) => s.selected);

  if (!currentSelected && !pendingSelected) return false;
  if (!currentSelected || !pendingSelected) return true;
  return currentSelected.dataKey !== pendingSelected.dataKey;
};

const hasLimitChanges = (
  limitOptions: InfiniteScrollMenuLimitOption[],
  pendingLimitOptions: InfiniteScrollMenuLimitOption[]
): boolean => {
  const currentSelected = limitOptions.find((l) => l.selected);
  const pendingSelected = pendingLimitOptions.find((l) => l.selected);

  if (!currentSelected && !pendingSelected) return false;
  if (!currentSelected || !pendingSelected) return true;
  return currentSelected.value !== pendingSelected.value;
};
