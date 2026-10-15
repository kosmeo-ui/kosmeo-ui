import { getContrastTextColor } from "../utils.js";
import { describe, expect, it } from "vitest";

describe("getContrastTextColor", () => {
  it("picks dark text on light backgrounds", () => {
    expect(getContrastTextColor("#ffffff")).toBe("dark");
    expect(getContrastTextColor("#ffeb3b")).toBe("dark");
  });

  it("picks light text on dark backgrounds", () => {
    expect(getContrastTextColor("#000000")).toBe("light");
    expect(getContrastTextColor("#1e3a8a")).toBe("light");
  });

  it("accepts a hex without the leading #", () => {
    expect(getContrastTextColor("000000")).toBe("light");
  });

  it("falls back to dark for shorthand or malformed hex", () => {
    expect(getContrastTextColor("#000")).toBe("dark");
    expect(getContrastTextColor("#zzzzzz")).toBe("dark");
  });
});
