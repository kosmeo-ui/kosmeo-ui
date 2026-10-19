import { hasRangeValue } from "./hasPendingChanges.js";
import {
  InfiniteScrollMenuGeneratedFilter,
  InfiniteScrollMenuLimitOption,
  InfiniteScrollMenuSortDataKey,
  SortDirection,
} from "../types.js";

interface GenerateQueryStringParams {
  filters: InfiniteScrollMenuGeneratedFilter[];
  limitOptions: InfiniteScrollMenuLimitOption[];
  sortBy: InfiniteScrollMenuSortDataKey[];
  sortDirection: SortDirection;
  dataLength: number;
  isNextPage?: boolean;
}

const generateQueryString = (params: GenerateQueryStringParams): string => {
  const {
    filters,
    limitOptions,
    sortBy,
    sortDirection,
    dataLength,
    isNextPage = false,
  } = params;

  const defaultLimit = 10;
  const limit = limitOptions.find((opt) => opt.selected)?.value || defaultLimit;
  const offset = isNextPage ? dataLength : 0;

  const queryParams = new URLSearchParams();
  queryParams.set("limit", String(limit));
  queryParams.set("offset", String(offset));

  // Sort params
  const selectedSort = sortBy.find((s) => s.selected);
  if (selectedSort) {
    queryParams.set("sort", selectedSort.dataKey);
    queryParams.set("sortDir", sortDirection);
  }

  for (const [name, value] of Object.entries(filterParams(filters))) {
    queryParams.set(name, value);
  }

  return queryParams.toString();
};

/**
 * The `filter[...]` query params for the filters' current values: simple
 * key-value pairs for server-side validation. Shared by InfiniteScroll and
 * TableFilters, so both send the same format.
 */
export const filterParams = (
  filters: InfiniteScrollMenuGeneratedFilter[]
): Record<string, string> => {
  const params: Record<string, string> = {};
  for (const filter of filters) {
    const key = filter.dataKey;

    if (filter.type === "SEARCH" && filter.value) {
      params[`filter[${key}]`] = filter.value;
      params[`filter[${key}_op]`] = "contains";
    } else if (filter.type === "RANGE") {
      if (hasRangeValue(filter.startValue)) {
        params[`filter[${key}_gte]`] = String(filter.startValue);
      }
      if (hasRangeValue(filter.endValue)) {
        params[`filter[${key}_lte]`] = String(filter.endValue);
      }
    } else if (filter.type === "SELECT") {
      const selectedOptions = filter.options
        .filter((opt) => opt.selected)
        .map((opt) => opt.id);
      if (selectedOptions.length > 0) {
        params[`filter[${key}]`] = selectedOptions.join(",");
        if (filter.multiSelect) {
          params[`filter[${key}_op]`] = "in";
        }
      }
    } else if (filter.type === "LIST" && filter.list) {
      params[`filter[${key}]`] = filter.list;
      params[`filter[${key}_op]`] = "in";
    }
  }
  return params;
};

export default generateQueryString;
