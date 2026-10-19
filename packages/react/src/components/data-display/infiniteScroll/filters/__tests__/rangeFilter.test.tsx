import { fireEvent, render } from "@testing-library/react";
import { GeneratedRangeFilter } from "../../types.js";
import { describe, expect, it, vi } from "vitest";
import RangeFilter from "../rangeFilter.js";

const filter = (
  rangeType: GeneratedRangeFilter["rangeType"],
  startValue?: string | number
): GeneratedRangeFilter => ({
  type: "RANGE",
  title: "Range",
  dataKey: "value",
  filterId: "value-0",
  rangeType,
  startValue,
});

const startInput = (container: HTMLElement) =>
  container.querySelectorAll<HTMLInputElement>(".k-filter-menu input")[0];

describe("RangeFilter", () => {
  it("clears a number bound to undefined rather than NaN", () => {
    const onFilterChange = vi.fn();
    const { container } = render(
      <RangeFilter
        filter={filter("NUMBER", 1000)}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.change(startInput(container), { target: { value: "" } });
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ startValue: undefined })
    );
  });

  it("keeps a 0 bound", () => {
    const onFilterChange = vi.fn();
    const { container } = render(
      <RangeFilter filter={filter("NUMBER")} onFilterChange={onFilterChange} />
    );
    fireEvent.change(startInput(container), { target: { value: "0" } });
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ startValue: 0 })
    );
  });

  it("sends a DATE bound as the picked calendar day", () => {
    const onFilterChange = vi.fn();
    const { container } = render(
      <RangeFilter filter={filter("DATE")} onFilterChange={onFilterChange} />
    );
    fireEvent.change(startInput(container), {
      target: { value: "2025-10-02" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ startValue: "2025-10-02" })
    );
  });

  it("shows a date-only bound in the date box", () => {
    const { container } = render(
      <RangeFilter
        filter={filter("DATE", "2025-10-02")}
        onFilterChange={vi.fn()}
      />
    );
    expect(startInput(container)).toHaveValue("2025-10-02");
  });

  it("clears a date bound without throwing", () => {
    const onFilterChange = vi.fn();
    const { container } = render(
      <RangeFilter
        filter={filter("DATE", "2025-10-02")}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.change(startInput(container), { target: { value: "" } });
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ startValue: undefined })
    );
  });
});
