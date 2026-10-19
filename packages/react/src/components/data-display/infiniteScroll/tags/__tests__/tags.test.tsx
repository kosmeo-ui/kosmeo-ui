import { InfiniteScrollMenuGeneratedFilter } from "../../types.js";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Tags from "../index.js";

const filters: InfiniteScrollMenuGeneratedFilter[] = [
  {
    type: "SELECT",
    title: "Status",
    dataKey: "status",
    filterId: "status-0",
    multiSelect: true,
    options: [
      { id: "active", name: "Active", selected: true },
      { id: "trial", name: "Trial", selected: true },
    ],
  },
];

describe("Tags", () => {
  it("keys each selected option's tag separately", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Tags filters={filters} handleNewFilters={vi.fn()} />);
    expect(error).not.toHaveBeenCalledWith(
      expect.stringContaining("same key"),
      expect.anything()
    );
    error.mockRestore();
  });

  it("removes only the tag whose remove button was clicked", async () => {
    const handleNewFilters = vi.fn();
    const { rerender } = render(
      <Tags filters={filters} handleNewFilters={handleNewFilters} />
    );
    const trial = screen.getByText("Status: Trial").closest(".k-badge")!;
    await userEvent.click(
      trial.querySelector<HTMLElement>("[aria-label='Remove']")!
    );

    const next = handleNewFilters.mock.calls[0][0];
    rerender(<Tags filters={next} handleNewFilters={handleNewFilters} />);
    expect(screen.getByText("Status: Active")).toBeInTheDocument();
    expect(screen.queryByText("Status: Trial")).not.toBeInTheDocument();
  });
});
