import { describe, expect, it } from "vitest";
import { pageRange } from "../utils.js";

describe("pageRange", () => {
  it.each([
    [1, 7, [1, 2, 3, 4, 5, 6, 7]],
    [4, 3, [1, 2, 3]],
    [1, 0, []],
  ])("lists every page that fits: page %i of %i", (page, count, expected) => {
    expect(pageRange(page, count)).toEqual(expected);
  });

  it.each([
    [1, 8, [1, 2, 3, 4, 5, "end-gap", 8]],
    [1, 10, [1, 2, 3, 4, 5, "end-gap", 10]],
    [3, 10, [1, 2, 3, 4, 5, "end-gap", 10]],
  ])(
    "puts a single gap at the end near the first page: page %i of %i",
    (page, count, expected) => {
      expect(pageRange(page, count)).toEqual(expected);
    }
  );

  it.each([
    [10, 10, [1, "start-gap", 6, 7, 8, 9, 10]],
    [8, 10, [1, "start-gap", 6, 7, 8, 9, 10]],
  ])(
    "puts a single gap at the start near the last page: page %i of %i",
    (page, count, expected) => {
      expect(pageRange(page, count)).toEqual(expected);
    }
  );

  it("puts gaps either side of the current page in the middle", () => {
    expect(pageRange(5, 10)).toEqual([1, "start-gap", 4, 5, 6, "end-gap", 10]);
  });

  it.each(Array.from({ length: 20 }, (_, i) => i + 1))(
    "keeps the same length on page %i of 20",
    (page) => {
      expect(pageRange(page, 20)).toHaveLength(7);
    }
  );

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
