import { hasActiveFilters, hasRangeValue } from "../hasPendingChanges.js";
import { InfiniteScrollMenuGeneratedFilter } from "../../types.js";
import generateQueryString from "../generateQueryString.js";
import { describe, expect, it } from "vitest";

const mrr = (
  startValue?: number | string,
  endValue?: number | string
): InfiniteScrollMenuGeneratedFilter => ({
  type: "RANGE",
  title: "MRR",
  dataKey: "mrr",
  filterId: "mrr-0",
  rangeType: "NUMBER",
  startValue,
  endValue,
});

const query = (filters: InfiniteScrollMenuGeneratedFilter[]) =>
  new URLSearchParams(
    generateQueryString({
      filters,
      limitOptions: [{ value: 25, selected: true }],
      sortBy: [],
      sortDirection: "desc",
      dataLength: 0,
    })
  );

describe("hasRangeValue", () => {
  it("treats 0 as a bound and empty or missing as none", () => {
    expect(hasRangeValue(0)).toBe(true);
    expect(hasRangeValue("2025-10-02")).toBe(true);
    expect(hasRangeValue("")).toBe(false);
    expect(hasRangeValue(undefined)).toBe(false);
  });
});

describe("hasActiveFilters", () => {
  it("counts a range starting at 0 as active", () => {
    expect(hasActiveFilters([mrr(0)])).toBe(true);
    expect(hasActiveFilters([mrr("", undefined)])).toBe(false);
  });
});

describe("generateQueryString", () => {
  it("sends a 0 bound and drops empty ones", () => {
    const params = query([mrr(0, "")]);
    expect(params.get("filter[mrr_gte]")).toBe("0");
    expect(params.has("filter[mrr_lte]")).toBe(false);
  });
});
