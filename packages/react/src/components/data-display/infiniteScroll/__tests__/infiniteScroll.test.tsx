import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InfiniteScrollMenu } from "../types.js";
import InfiniteScroll from "../index.js";

const menu: InfiniteScrollMenu = {
  title: "Customers",
  filters: [
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
  ],
};

const setup = () => {
  const onQueryChange = vi.fn();
  render(
    <InfiniteScroll
      menu={menu}
      data={[{ id: 1, name: "Ada" }]}
      columns={[{ title: "Name", dataKey: "name" }]}
      hasMore={false}
      isLoading={false}
      onQueryChange={onQueryChange}
      onReload={vi.fn()}
    />
  );
  const lastQuery = () =>
    new URLSearchParams(onQueryChange.mock.calls.at(-1)?.[0] ?? "");
  return { lastQuery };
};

const selectActive = async () => {
  await userEvent.click(screen.getByRole("button", { name: /Status/ }));
  await userEvent.click(screen.getByRole("checkbox", { name: "Active" }));
};

describe("InfiniteScroll filters", () => {
  it("shows a tag only once the filter is applied", async () => {
    const { lastQuery } = setup();
    await selectActive();
    expect(screen.queryByText("Status: Active")).not.toBeInTheDocument();
    expect(lastQuery().has("filter[status]")).toBe(false);

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Status: Active")).toBeInTheDocument();
    expect(lastQuery().get("filter[status]")).toBe("active");
  });

  it("applies the removal when a tag is removed", async () => {
    const { lastQuery } = setup();
    await selectActive();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(lastQuery().has("filter[status]")).toBe(false);
    expect(screen.queryByText("Status: Active")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("applies a search on Enter", async () => {
    const { lastQuery } = setup();
    await userEvent.type(screen.getByLabelText("Name"), "Ada{Enter}");
    expect(lastQuery().get("filter[name]")).toBe("Ada");
  });

  it("keeps Reset available while applied filters are active", async () => {
    const { lastQuery } = setup();
    await selectActive();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    // Unticking leaves nothing pending but the table is still filtered.
    await userEvent.click(screen.getByRole("checkbox", { name: "Active" }));

    const reset = screen.getByRole("button", { name: "Reset" });
    expect(reset).toBeEnabled();
    await userEvent.click(reset);
    expect(lastQuery().has("filter[status]")).toBe(false);
  });
});
