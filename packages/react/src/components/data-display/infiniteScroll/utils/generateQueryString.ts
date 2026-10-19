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

  // Filter params - simple key-value format for server-side validation
  for (const filter of filters) {
    const key = filter.dataKey;

    if (filter.type === "SEARCH" && filter.value) {
      queryParams.set(`filter[${key}]`, filter.value);
      queryParams.set(`filter[${key}_op]`, "contains");
    } else if (filter.type === "RANGE") {
      if (hasRangeValue(filter.startValue)) {
        queryParams.set(`filter[${key}_gte]`, String(filter.startValue));
      }
      if (hasRangeValue(filter.endValue)) {
        queryParams.set(`filter[${key}_lte]`, String(filter.endValue));
      }
    } else if (filter.type === "SELECT") {
      const selectedOptions = filter.options
        .filter((opt) => opt.selected)
        .map((opt) => opt.id);
      if (selectedOptions.length > 0) {
        queryParams.set(`filter[${key}]`, selectedOptions.join(","));
        if (filter.multiSelect) {
          queryParams.set(`filter[${key}_op]`, "in");
        }
      }
    } else if (filter.type === "LIST" && filter.list) {
      queryParams.set(`filter[${key}]`, filter.list);
      queryParams.set(`filter[${key}_op]`, "in");
    }
  }

  return queryParams.toString();
};

export default generateQueryString;
