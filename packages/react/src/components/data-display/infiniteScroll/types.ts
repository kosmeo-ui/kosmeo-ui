import type { DataKey } from "../dataTable/types.js";

export type {
  DataKey,
  TableColumn,
  TableRow,
  TableLeadingColumn,
} from "../dataTable/types.js";

export type RangeType = "DATE" | "DATETIME" | "NUMBER" | "STRING";
export type RangeValue = string | number;
export type SortDirection = "asc" | "desc";

export interface InfiniteScrollMenu {
  title: string;
  limitOptions?: InfiniteScrollMenuLimitOption[];
  filters?: InfiniteScrollMenuFilter[];
  sort?: InfiniteScrollMenuSort;
}

export type InfiniteScrollMenuFilter =
  RangeFilter | SearchFilter | SelectFilter | ListFilter;

export type InfiniteScrollMenuGeneratedFilter =
  | GeneratedRangeFilter
  | GeneratedSearchFilter
  | GeneratedSelectFilter
  | GeneratedListFilter;

interface BaseFilter {
  title: string;
  dataKey: DataKey;
  searchType?: SearchType[];
}

interface GeneratedBaseFilter extends BaseFilter {
  filterId: string;
}

export interface RangeFilter extends BaseFilter {
  type: "RANGE";
  startValue?: RangeValue;
  endValue?: RangeValue;
  rangeType?: RangeType;
}

export interface GeneratedRangeFilter
  extends RangeFilter, GeneratedBaseFilter {}

export interface SearchFilter extends BaseFilter {
  type: "SEARCH";
  value?: string;
}

export interface GeneratedSearchFilter
  extends SearchFilter, GeneratedBaseFilter {}

export interface SelectFilter extends BaseFilter {
  type: "SELECT";
  options: InfiniteScrollMenuFilterOption[];
  multiSelect?: boolean;
}

export interface GeneratedSelectFilter
  extends SelectFilter, GeneratedBaseFilter {}

export interface ListFilter extends BaseFilter {
  type: "LIST";
  list: string;
}

export interface GeneratedListFilter extends ListFilter, GeneratedBaseFilter {}

/**
 * SearchType allows a more complex search to be performed on the data.
 *
 * For example, if you want to search for a string that starts with a value, you would use the "startsWith" type.
 *
 * @example
 * const dataKey = "tasks.assignee.email"
 * const searchType = {
 *  type: "startsWith",
 *  key: "email"
 * }
 * // This will search for the email that starts with the value provided
 */
export interface SearchType {
  /** The Prisma search type to use */
  type:
    | "some"
    | "every"
    | "none"
    | "in"
    | "gte"
    | "lte"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "not";
  /** The dataKey segment to use the type with */
  key: string;
}

export interface InfiniteScrollMenuFilterOption {
  id: number | string;
  name: string;
  selected: boolean;
}

export interface InfiniteScrollMenuLimitOption {
  value: number;
  selected: boolean;
}

export interface InfiniteScrollMenuSort {
  sortDataKeys: InfiniteScrollMenuSortDataKey[];
  /** Sort direction to use on load. Defaults to desc */
  sortDirection?: SortDirection;
}

export interface InfiniteScrollMenuSortDataKey {
  dataKey: DataKey;
  displayName: string;
  selected: boolean;
}
