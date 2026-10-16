import generateQueryString from "../generateQueryString.js";
import { describe, expect, it } from "vitest";
import {
  GeneratedListFilter,
  GeneratedRangeFilter,
  GeneratedSearchFilter,
  GeneratedSelectFilter,
  InfiniteScrollMenuGeneratedFilter,
  InfiniteScrollMenuLimitOption,
  InfiniteScrollMenuSortDataKey,
} from "../../types.js";

const limits = (selected?: number): InfiniteScrollMenuLimitOption[] =>
  [25, 50, 100].map((value) => ({ value, selected: value === selected }));

const sortKeys = (selected?: string): InfiniteScrollMenuSortDataKey[] =>
  ["name", "createdAt"].map((dataKey) => ({
    dataKey,
    displayName: dataKey,
    selected: dataKey === selected,
  }));

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

const select = (
  selectedIds: (string | number)[],
  multiSelect?: boolean
): GeneratedSelectFilter => ({
  type: "SELECT",
  title: "Status",
  dataKey: "status",
  filterId: "status-0",
  multiSelect,
  options: [
    { id: 1, name: "Active", selected: selectedIds.includes(1) },
    { id: 2, name: "Closed", selected: selectedIds.includes(2) },
  ],
});

const list = (value: string): GeneratedListFilter => ({
  type: "LIST",
  title: "SKUs",
  dataKey: "sku",
  filterId: "sku-0",
  list: value,
});

/** The query for `params` over a 25-row page, as a plain object. */
const query = (
  params: Partial<Parameters<typeof generateQueryString>[0]> = {}
) =>
  Object.fromEntries(
    new URLSearchParams(
      generateQueryString({
        filters: [],
        limitOptions: limits(25),
        sortBy: [],
        sortDirection: "desc",
        dataLength: 0,
        ...params,
      })
    )
  );

describe("generateQueryString", () => {
  it("uses the selected limit", () => {
    expect(query({ limitOptions: limits(50) })).toEqual({
      limit: "50",
      offset: "0",
    });
  });

  it("falls back to a limit of 10 when no limit is selected", () => {
    expect(query({ limitOptions: limits() })).toEqual({
      limit: "10",
      offset: "0",
    });
  });

  it("starts at offset 0 for a fresh query, whatever is loaded", () => {
    expect(query({ dataLength: 40 })).toEqual({ limit: "25", offset: "0" });
  });

  it("starts the next page after the loaded rows", () => {
    expect(query({ dataLength: 40, isNextPage: true })).toEqual({
      limit: "25",
      offset: "40",
    });
  });

  it("sorts by the selected key in the given direction", () => {
    expect(
      query({ sortBy: sortKeys("createdAt"), sortDirection: "asc" })
    ).toEqual({ limit: "25", offset: "0", sort: "createdAt", sortDir: "asc" });
  });

  it("leaves out sort and direction when no key is selected", () => {
    expect(query({ sortBy: sortKeys(), sortDirection: "asc" })).toEqual({
      limit: "25",
      offset: "0",
    });
  });

  it("filters a search with contains", () => {
    expect(query({ filters: [search("ann")] })).toEqual({
      limit: "25",
      offset: "0",
      "filter[name]": "ann",
      "filter[name_op]": "contains",
    });
  });

  it.each([[undefined], [""]])("leaves out a search of %j", (value) => {
    expect(query({ filters: [search(value)] })).toEqual({
      limit: "25",
      offset: "0",
    });
  });

  it.each<[string | number | undefined, string | number | undefined, object]>([
    [5, undefined, { "filter[price_gte]": "5" }],
    [undefined, 10, { "filter[price_lte]": "10" }],
    [5, 10, { "filter[price_gte]": "5", "filter[price_lte]": "10" }],
    [0, 0, { "filter[price_gte]": "0", "filter[price_lte]": "0" }],
    [undefined, undefined, {}],
  ])("filters a range from %j to %j", (start, end, expected) => {
    expect(query({ filters: [range(start, end)] })).toEqual({
      limit: "25",
      offset: "0",
      ...expected,
    });
  });

  // Bug: a range field the user clears is "" and is still sent, as an empty
  // filter[price_gte]= — hasPendingChanges treats "" as unset.
  it.fails("leaves out a cleared range bound", () => {
    expect(query({ filters: [range("", 10)] })).toEqual({
      limit: "25",
      offset: "0",
      "filter[price_lte]": "10",
    });
  });

  it("filters a single select by its option's id, with no operator", () => {
    expect(query({ filters: [select([2])] })).toEqual({
      limit: "25",
      offset: "0",
      "filter[status]": "2",
    });
  });

  it.each<[(string | number)[], object]>([
    [[1], { "filter[status]": "1" }],
    [[1, 2], { "filter[status]": "1,2" }],
  ])("filters a multi select of %j with in", (ids, expected) => {
    expect(query({ filters: [select(ids, true)] })).toEqual({
      limit: "25",
      offset: "0",
      ...expected,
      "filter[status_op]": "in",
    });
  });

  it("leaves out a select with nothing selected", () => {
    expect(query({ filters: [select([], true)] })).toEqual({
      limit: "25",
      offset: "0",
    });
  });

  it("filters a list with in", () => {
    expect(query({ filters: [list("a1,b2")] })).toEqual({
      limit: "25",
      offset: "0",
      "filter[sku]": "a1,b2",
      "filter[sku_op]": "in",
    });
  });

  it("leaves out an empty list", () => {
    expect(query({ filters: [list("")] })).toEqual({
      limit: "25",
      offset: "0",
    });
  });

  it("combines every filter with the sort and page", () => {
    const filters: InfiniteScrollMenuGeneratedFilter[] = [
      search("ann"),
      range(5),
      select([1]),
      list("a1"),
    ];

    expect(
      query({
        filters,
        limitOptions: limits(100),
        sortBy: sortKeys("name"),
        dataLength: 100,
        isNextPage: true,
      })
    ).toEqual({
      limit: "100",
      offset: "100",
      sort: "name",
      sortDir: "desc",
      "filter[name]": "ann",
      "filter[name_op]": "contains",
      "filter[price_gte]": "5",
      "filter[status]": "1",
      "filter[sku]": "a1",
      "filter[sku_op]": "in",
    });
  });

  it("encodes the filter brackets and values for a URL", () => {
    expect(
      generateQueryString({
        filters: [search("a&b")],
        limitOptions: limits(25),
        sortBy: [],
        sortDirection: "desc",
        dataLength: 0,
      })
    ).toBe(
      "limit=25&offset=0&filter%5Bname%5D=a%26b&filter%5Bname_op%5D=contains"
    );
  });
});
