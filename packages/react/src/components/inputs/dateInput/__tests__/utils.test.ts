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
    expect(toDateInputValue(new Date(2024, 11, 31).toISOString())).toBe(
      "2024-12-31"
    );
  });

  it("keeps a date-only string on its calendar day", () => {
    expect(toDateInputValue("2026-10-14")).toBe("2026-10-14");
  });

  it.each([null, undefined, "", "not a date"])(
    "returns an empty string for %j",
    (value) => {
      expect(toDateInputValue(value)).toBe("");
    }
  );
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

  it.each([null, "nope"])("returns an empty string for %j", (value) => {
    expect(toDateTimeLocalValue(value)).toBe("");
  });
});

describe("dateTimeLocalToIso", () => {
  it("reads the value as local time", () => {
    expect(dateTimeLocalToIso("2024-03-09T07:05")).toBe(
      new Date(2024, 2, 9, 7, 5).toISOString()
    );
  });

  it.each(["", "garbage"])("returns null for %j", (value) => {
    expect(dateTimeLocalToIso(value)).toBeNull();
  });
});
