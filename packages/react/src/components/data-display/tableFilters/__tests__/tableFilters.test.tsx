import { InfiniteScrollMenuFilter } from "../../infiniteScroll/types.js";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TableFilters from "../index.js";

const filters: InfiniteScrollMenuFilter[] = [
  { type: "SEARCH", title: "Name", dataKey: "name" },
  {
    type: "SELECT",
    title: "Status",
    dataKey: "status",
    multiSelect: true,
    options: [
      { id: "active", name: "Active", selected: false },
      { id: "trial", name: "Trial", selected: false },
    ],
  },
  { type: "RANGE", title: "MRR", dataKey: "mrr", rangeType: "NUMBER" },
];

const setup = (applyMode?: "immediate" | "manual") => {
  const onChange = vi.fn();
  render(
    <TableFilters filters={filters} onChange={onChange} applyMode={applyMode} />
  );
  const last = () => onChange.mock.calls.at(-1)?.[0];
  return { onChange, last };
};

const tick = async (name: string) => {
  await userEvent.click(screen.getByRole("button", { name: /Status/ }));
  await userEvent.click(screen.getByRole("checkbox", { name }));
};

describe("TableFilters", () => {
  it("reports no filters on mount", () => {
    const { onChange } = setup();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("reports ticked options as filter params", async () => {
    const { last } = setup();
    await tick("Active");
    await tick("Trial");
    await waitFor(() =>
      expect(last()).toEqual({
        "filter[status]": "active,trial",
        "filter[status_op]": "in",
      })
    );
    expect(screen.getByText("Status: Active")).toBeInTheDocument();
  });

  it("waits for a pause in typing, and Enter applies at once", async () => {
    const { last } = setup();
    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    expect(last()).toEqual({});
    await userEvent.type(screen.getByLabelText("Name"), "{Enter}");
    expect(last()).toEqual({
      "filter[name]": "Ada",
      "filter[name_op]": "contains",
    });
  });

  it("clears everything on Reset and when a tag is removed", async () => {
    const { last } = setup();
    await tick("Active");
    await waitFor(() => expect(last()).toHaveProperty("filter[status]"));
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(last()).toEqual({});

    await tick("Trial");
    await waitFor(() => expect(last()).toHaveProperty("filter[status]"));
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(last()).toEqual({});
  });

  it("applies a range from its menu's Apply button, both bounds at once", async () => {
    const { onChange, last } = setup();
    await userEvent.click(screen.getByRole("button", { name: /MRR/ }));
    const [start, end] = document.querySelectorAll<HTMLInputElement>(
      ".k-filter-menu input[type=number]"
    );
    await userEvent.type(start, "100");
    await userEvent.type(end, "500");
    await new Promise((r) => setTimeout(r, 500));
    expect(onChange).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() =>
      expect(last()).toEqual({
        "filter[mrr_gte]": "100",
        "filter[mrr_lte]": "500",
      })
    );
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("waits for Apply in manual mode", async () => {
    const { onChange, last } = setup("manual");
    await tick("Active");
    expect(onChange).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(last()).toEqual({
      "filter[status]": "active",
      "filter[status_op]": "in",
    });
  });
});
