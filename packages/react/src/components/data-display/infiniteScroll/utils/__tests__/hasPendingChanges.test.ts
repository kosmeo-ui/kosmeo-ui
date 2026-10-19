import { describe, expect, it } from "vitest";
import {
  clearFilters,
  hasActiveFilters,
  hasPendingChanges,
  hasTypedFilterChanges,
} from "../hasPendingChanges.js";
import {
  GeneratedListFilter,
  GeneratedRangeFilter,
  GeneratedSearchFilter,
  GeneratedSelectFilter,
  InfiniteScrollMenuGeneratedFilter,
  InfiniteScrollMenuLimitOption,
  InfiniteScrollMenuSortDataKey,
  SortDirection,
} from "../../types.js";

const search = (value?: string): GeneratedSearchFilter => ({
  type: "SEARCH",
  title: "Name",
  dataKey: "name",
  filterId: "name-0",
  value,
});

const range = (
  startValue?: string | number,
  endValue?: string | number
): GeneratedRangeFilter => ({
  type: "RANGE",
  title: "Price",
  dataKey: "price",
  filterId: "price-0",
  rangeType: "NUMBER",
  startValue,
  endValue,
});

const select = (...selectedIds: number[]): GeneratedSelectFilter => ({
  type: "SELECT",
  title: "Status",
  dataKey: "status",
  filterId: "status-0",
  multiSelect: true,
  options: [1, 2, 3].map((id) => ({
    id,
    name: `Option ${id}`,
    selected: selectedIds.includes(id),
  })),
});

const list = (value?: string): GeneratedListFilter => ({
  type: "LIST",
  title: "SKUs",
  dataKey: "sku",
  filterId: "sku-0",
  list: value as string,
});

const limits = (selected?: number): InfiniteScrollMenuLimitOption[] =>
  [25, 50].map((value) => ({ value, selected: value === selected }));

const sortKeys = (selected?: string): InfiniteScrollMenuSortDataKey[] =>
  ["name", "createdAt"].map((dataKey) => ({
    dataKey,
    displayName: dataKey,
    selected: dataKey === selected,
  }));

/** Applied and pending state that match, overridden per case. */
const changes = (
  params: Partial<{
    filters: InfiniteScrollMenuGeneratedFilter[];
    pendingFilters: InfiniteScrollMenuGeneratedFilter[];
    sortBy: InfiniteScrollMenuSortDataKey[];
    pendingSortBy: InfiniteScrollMenuSortDataKey[];
    sortDirection: SortDirection;
    pendingSortDirection: SortDirection;
    limitOptions: InfiniteScrollMenuLimitOption[];
    pendingLimitOptions: InfiniteScrollMenuLimitOption[];
  }>
) =>
  hasPendingChanges({
    filters: [],
    pendingFilters: [],
    sortBy: sortKeys("name"),
    pendingSortBy: sortKeys("name"),
    sortDirection: "desc",
    pendingSortDirection: "desc",
    limitOptions: limits(25),
    pendingLimitOptions: limits(25),
    ...params,
  });

describe("hasPendingChanges", () => {
  it("is false when nothing differs", () => {
    expect(changes({})).toBe(false);
  });

  it.each<
    [
      string,
      InfiniteScrollMenuGeneratedFilter,
      InfiniteScrollMenuGeneratedFilter,
    ]
  >([
    ["the search value", search("ann"), search("ann")],
    ["empty search, as Reset leaves it", search(""), search(undefined)],
    ["range", range(1, 9), range(1, 9)],
    ["emptied range start", range("", 9), range(undefined, 9)],
    ["emptied range end", range(1, ""), range(1, undefined)],
    ["selected options", select(1, 3), select(1, 3)],
    ["list", list("a,b"), list("a,b")],
    ["emptied list", list(""), list(undefined)],
  ])("is false when the %s matches", (_name, applied, pending) => {
    expect(changes({ filters: [applied], pendingFilters: [pending] })).toBe(
      false
    );
  });

  it.each<
    [
      string,
      InfiniteScrollMenuGeneratedFilter,
      InfiniteScrollMenuGeneratedFilter,
    ]
  >([
    ["the search value", search("ann"), search("bob")],
    ["a search typed into an unset one", search(undefined), search("a")],
    ["the range start", range(1, 9), range(2, 9)],
    ["the range end", range(1, 9), range(1, 8)],
    ["a range start entered where none was", range(undefined, 9), range(1, 9)],
    ["the number of selected options", select(1), select(1, 2)],
    ["which options are selected", select(1), select(2)],
    ["the list", list("a"), list("a,b")],
  ])("is true when %s changes", (_name, applied, pending) => {
    expect(changes({ filters: [applied], pendingFilters: [pending] })).toBe(
      true
    );
  });

  it.each<
    [
      string,
      InfiniteScrollMenuGeneratedFilter,
      InfiniteScrollMenuGeneratedFilter,
    ]
  >([
    ["search", search(undefined), search("")],
    ["range start", range(undefined, 9), range("", 9)],
    ["range end", range(1, undefined), range(1, "")],
  ])(
    "is false for a %s typed into and emptied again",
    (_name, applied, pending) => {
      expect(changes({ filters: [applied], pendingFilters: [pending] })).toBe(
        false
      );
    }
  );

  it("is true when a pending filter is missing", () => {
    expect(
      changes({
        filters: [search("a"), list("b")],
        pendingFilters: [search("a")],
      })
    ).toBe(true);
  });

  it("is true for a changed sort direction", () => {
    expect(changes({ pendingSortDirection: "asc" })).toBe(true);
  });

  it.each<[string | undefined, string | undefined, boolean]>([
    ["name", "createdAt", true],
    ["name", undefined, true],
    [undefined, "name", true],
    [undefined, undefined, false],
  ])("compares the sort key %s with %s", (applied, pending, expected) => {
    expect(
      changes({ sortBy: sortKeys(applied), pendingSortBy: sortKeys(pending) })
    ).toBe(expected);
  });

  it.each<[number | undefined, number | undefined, boolean]>([
    [25, 50, true],
    [25, undefined, true],
    [undefined, 25, true],
    [undefined, undefined, false],
  ])("compares the limit %s with %s", (applied, pending, expected) => {
    expect(
      changes({
        limitOptions: limits(applied),
        pendingLimitOptions: limits(pending),
      })
    ).toBe(expected);
  });
});

describe("hasActiveFilters", () => {
  it("is false with no filters", () => {
    expect(hasActiveFilters([])).toBe(false);
  });

  it.each<[string, InfiniteScrollMenuGeneratedFilter]>([
    ["a search value", search("a")],
    ["a range start", range(1)],
    ["a range end", range(undefined, 9)],
    ["a selected option", select(2)],
    ["a list", list("a")],
  ])("is true for %s", (_name, filter) => {
    expect(hasActiveFilters([filter])).toBe(true);
  });

  it.each<[string, InfiniteScrollMenuGeneratedFilter]>([
    ["an empty search", search("")],
    ["an unset search", search(undefined)],
    ["an unset range", range()],
    ["no selected option", select()],
    ["an empty list", list("")],
  ])("is false for %s", (_name, filter) => {
    expect(hasActiveFilters([filter])).toBe(false);
  });

  it("is true when any one filter is active", () => {
    expect(hasActiveFilters([search(""), select(), list("a")])).toBe(true);
  });

  it.each<[string, GeneratedRangeFilter]>([
    ["start", range(0)],
    ["end", range(undefined, 0)],
  ])("is true for a range %s of 0", (_name, filter) => {
    expect(hasActiveFilters([filter])).toBe(true);
  });
});

describe("clearFilters", () => {
  it("leaves no filter active", () => {
    expect(
      hasActiveFilters(
        clearFilters([search("ann"), range(0, 9), select(1, 2), list("a1")])
      )
    ).toBe(false);
  });
});

describe("hasTypedFilterChanges", () => {
  it.each<[string, InfiniteScrollMenuGeneratedFilter, boolean]>([
    ["an edited search", search("ann"), true],
    ["an edited range", range(5), false],
    ["a picked option", select(1), false],
  ])("treats %s as typed: %s", (_name, pending, typed) => {
    expect(hasTypedFilterChanges(clearFilters([pending]), [pending])).toBe(
      typed
    );
  });

  it("is false with nothing pending", () => {
    expect(hasTypedFilterChanges([search("ann")], [search("ann")])).toBe(false);
  });
});
