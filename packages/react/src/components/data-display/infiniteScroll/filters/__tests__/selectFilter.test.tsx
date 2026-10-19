import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { GeneratedSelectFilter } from "../../types.js";
import { describe, expect, it, vi } from "vitest";
import SelectFilter from "../selectFilter.js";

const filter = (multiSelect: boolean): GeneratedSelectFilter => ({
  type: "SELECT",
  title: "Status",
  dataKey: "status",
  filterId: "status-0",
  multiSelect,
  options: [
    { id: "active", name: "Active", selected: false },
    { id: "trial", name: "Trial", selected: true },
  ],
});

describe("SelectFilter", () => {
  it("lists options as checkboxes reflecting their selection", async () => {
    render(<SelectFilter filter={filter(true)} onFilterChange={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /Status/ }));
    expect(screen.getByRole("checkbox", { name: "Active" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Trial" })).toBeChecked();
  });

  it("keeps other selections in multi-select mode", async () => {
    const onFilterChange = vi.fn();
    render(
      <SelectFilter filter={filter(true)} onFilterChange={onFilterChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Status/ }));
    await userEvent.click(screen.getByText("Active"));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { id: "active", name: "Active", selected: true },
          { id: "trial", name: "Trial", selected: true },
        ],
      })
    );
  });

  it("clears other selections in single-select mode", async () => {
    const onFilterChange = vi.fn();
    render(
      <SelectFilter filter={filter(false)} onFilterChange={onFilterChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Status/ }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Active" }));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { id: "active", name: "Active", selected: true },
          { id: "trial", name: "Trial", selected: false },
        ],
      })
    );
  });
});
