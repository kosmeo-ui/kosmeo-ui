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
    expect(toDateInputValue(new Date(2024, 11, 31).toISOString())).toBe(
      "2024-12-31"
    );
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

  it.each([null, "nope"])("returns an empty string for %j", (value) => {
    expect(toDateTimeLocalValue(value)).toBe("");
  });
});

describe("dateInputToIso", () => {
  it("reads the date as local midnight", () => {
    expect(dateInputToIso("2024-01-05")).toBe(
      new Date(2024, 0, 5).toISOString()
    );
  });

  it.each(["", "2024-13-45"])("returns null for %j", (value) => {
    expect(dateInputToIso(value)).toBeNull();
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

  it.each(["", "garbage"])("returns null for %j", (value) => {
    expect(dateTimeLocalToIso(value)).toBeNull();
  });
});
