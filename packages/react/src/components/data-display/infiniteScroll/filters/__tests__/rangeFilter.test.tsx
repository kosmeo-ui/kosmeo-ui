import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
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

describe("RangeFilter with applyInMenu", () => {
  const inputs = (container: HTMLElement) =>
    container.querySelectorAll<HTMLInputElement>(".k-filter-menu input");

  const setup = () => {
    const onFilterChange = vi.fn();
    const utils = render(
      <RangeFilter
        filter={filter("NUMBER")}
        onFilterChange={onFilterChange}
        applyInMenu
      />
    );
    return { onFilterChange, ...utils };
  };

  it("reports both bounds together on Apply", async () => {
    const { onFilterChange, container } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Range/ }));
    await userEvent.type(inputs(container)[0], "100");
    await userEvent.type(inputs(container)[1], "500");
    expect(onFilterChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ startValue: 100, endValue: 500 })
    );
  });

  it("applies on Enter", async () => {
    const { onFilterChange, container } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Range/ }));
    await userEvent.type(inputs(container)[0], "100{Enter}");
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ startValue: 100 })
    );
  });

  it("drops the draft when the menu closes without Apply", async () => {
    const { onFilterChange, container } = setup();
    const trigger = screen.getByRole("button", { name: /Range/ });
    await userEvent.click(trigger);
    await userEvent.type(inputs(container)[0], "100");
    await userEvent.click(trigger);
    expect(onFilterChange).not.toHaveBeenCalled();
    expect(inputs(container)[0]).toHaveValue(null);
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });
});
