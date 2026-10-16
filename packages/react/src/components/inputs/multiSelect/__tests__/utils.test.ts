import { describe, expect, it } from "vitest";
import { itemKeys } from "../utils.js";

describe("itemKeys", () => {
  it("keys by the value field when there is one", () => {
    const items = [
      { value: 1, name: "One" },
      { value: 2, name: "One" },
    ];
    expect(itemKeys(items, "name")).toEqual(["1", "2"]);
  });

  it("falls back to the label", () => {
    expect(itemKeys([{ name: "A" }, { name: "B" }], "name")).toEqual([
      "A",
      "B",
    ]);
  });

  it("suffixes repeats so keys stay unique", () => {
    const items = [{ name: "A" }, { name: "A" }, { name: "B" }, { name: "A" }];
    expect(itemKeys(items, "name")).toEqual(["A", "A#1", "B", "A#2"]);
  });
});
