import { describe, expect, it } from "vitest";
import { itemKeys } from "../utils.js";

describe("itemKeys", () => {
  it.each([
    [
      "keys by the value field when there is one",
      [
        { value: 1, name: "One" },
        { value: 2, name: "One" },
      ],
      ["1", "2"],
    ],
    ["falls back to the label", [{ name: "A" }, { name: "B" }], ["A", "B"]],
    [
      "suffixes repeats so keys stay unique",
      [{ name: "A" }, { name: "A" }, { name: "B" }, { name: "A" }],
      ["A", "A#1", "B", "A#2"],
    ],
  ])("%s", (_, items: { value?: number; name: string }[], expected) => {
    expect(itemKeys(items, "name")).toEqual(expected);
  });
});
