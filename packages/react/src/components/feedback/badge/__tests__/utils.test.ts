import { getContrastTextColor } from "../utils.js";
import { describe, expect, it } from "vitest";

describe("getContrastTextColor", () => {
  it.each([
    ["#ffffff", "dark"],
    ["#ffeb3b", "dark"],
    ["#000000", "light"],
    ["#1e3a8a", "light"],
    ["#808080", "dark"],
    ["#7f7f7f", "light"],
  ])("picks contrasting text on %s", (hex, expected) => {
    expect(getContrastTextColor(hex)).toBe(expected);
  });

  it("accepts a hex without the leading #", () => {
    expect(getContrastTextColor("000000")).toBe("light");
  });

  it.each(["#000", "#zzzzzz"])(
    "falls back to dark for shorthand or malformed hex %s",
    (hex) => {
      expect(getContrastTextColor(hex)).toBe("dark");
    }
  );
});
