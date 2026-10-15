import { describe, expect, it } from "vitest";
import {
  dateInputToIso,
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

  it("returns an empty string for empty or invalid values", () => {
    expect(toDateTimeLocalValue(null)).toBe("");
    expect(toDateTimeLocalValue("nope")).toBe("");
  });
});

describe("dateInputToIso", () => {
  it("reads the date as local midnight", () => {
    expect(dateInputToIso("2024-01-05")).toBe(
      new Date(2024, 0, 5).toISOString()
    );
  });

  it("returns null for empty or invalid values", () => {
    expect(dateInputToIso("")).toBeNull();
    expect(dateInputToIso("2024-13-45")).toBeNull();
  });

  it("round-trips through toDateInputValue", () => {
    expect(toDateInputValue(dateInputToIso("2024-07-04"))).toBe("2024-07-04");
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
