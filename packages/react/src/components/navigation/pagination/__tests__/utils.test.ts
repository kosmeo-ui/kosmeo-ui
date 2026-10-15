import { describe, expect, it } from "vitest";
import { pageRange } from "../utils.js";

describe("pageRange", () => {
  it("lists every page when they all fit", () => {
    expect(pageRange(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pageRange(4, 3)).toEqual([1, 2, 3]);
  });

  it("returns nothing for zero pages", () => {
    expect(pageRange(1, 0)).toEqual([]);
  });

  it("puts a single gap at the end near the first page", () => {
    expect(pageRange(1, 10)).toEqual([1, 2, 3, 4, 5, "end-gap", 10]);
    expect(pageRange(3, 10)).toEqual([1, 2, 3, 4, 5, "end-gap", 10]);
  });

  it("puts a single gap at the start near the last page", () => {
    expect(pageRange(10, 10)).toEqual([1, "start-gap", 6, 7, 8, 9, 10]);
    expect(pageRange(8, 10)).toEqual([1, "start-gap", 6, 7, 8, 9, 10]);
  });

  it("puts gaps either side of the current page in the middle", () => {
    expect(pageRange(5, 10)).toEqual([1, "start-gap", 4, 5, 6, "end-gap", 10]);
  });

  it("keeps the same length on every page", () => {
    const lengths = new Set(
      Array.from({ length: 20 }, (_, i) => pageRange(i + 1, 20).length)
    );
    expect(lengths).toEqual(new Set([7]));
  });

  it("widens the window with more siblings", () => {
    expect(pageRange(10, 20, 2)).toEqual([
      1,
      "start-gap",
      8,
      9,
      10,
      11,
      12,
      "end-gap",
      20,
    ]);
  });
});
