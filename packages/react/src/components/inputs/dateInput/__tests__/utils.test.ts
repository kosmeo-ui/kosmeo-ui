import { describe, expect, it } from "vitest";
import {
  dateTimeLocalToIso,
  toDateInputValue,
  toDateTimeLocalValue,
} from "../utils.js";

describe("toDateInputValue", () => {
  it("formats a Date as yyyy-mm-dd in local time", () => {
    expect(toDateInputValue(new Date(2024, 0, 5, 23, 30))).toBe("2024-01-05");
  });

  it("accepts an ISO string", () => {
    const iso = new Date(2024, 11, 31).toISOString();
    expect(toDateInputValue(iso)).toBe("2024-12-31");
  });

  it("keeps a date-only string on its calendar day", () => {
    expect(toDateInputValue("2026-10-14")).toBe("2026-10-14");
  });

  it("returns an empty string for empty or invalid values", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue(undefined)).toBe("");
    expect(toDateInputValue("")).toBe("");
    expect(toDateInputValue("not a date")).toBe("");
  });
});

describe("toDateTimeLocalValue", () => {
  it("formats a Date as yyyy-mm-ddThh:mm in local time", () => {
    expect(toDateTimeLocalValue(new Date(2024, 2, 9, 7, 5))).toBe(
      "2024-03-09T07:05"
    );
  });

  it("reads a date-only string as local midnight", () => {
    expect(toDateTimeLocalValue("2026-10-14")).toBe("2026-10-14T00:00");
  });

  it("returns an empty string for empty or invalid values", () => {
    expect(toDateTimeLocalValue(null)).toBe("");
    expect(toDateTimeLocalValue("nope")).toBe("");
  });
});

describe("dateTimeLocalToIso", () => {
  it("reads the value as local time", () => {
    expect(dateTimeLocalToIso("2024-03-09T07:05")).toBe(
      new Date(2024, 2, 9, 7, 5).toISOString()
    );
  });

  it("returns null for empty or invalid values", () => {
    expect(dateTimeLocalToIso("")).toBeNull();
    expect(dateTimeLocalToIso("garbage")).toBeNull();
  });
});
