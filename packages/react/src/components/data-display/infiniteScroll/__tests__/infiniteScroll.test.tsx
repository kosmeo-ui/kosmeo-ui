import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import InfiniteScroll from "../index.js";
import type { Mock } from "vitest";
import { DateTime } from "luxon";
import {
  InfiniteScrollMenu,
  InfiniteScrollMenuFilter,
  TableColumn,
} from "../types.js";

type Person = { id: number; name: string };
type Props = Parameters<typeof InfiniteScroll<Person>>[0];

const people: Person[] = [
  { id: 1, name: "Ann" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Cy" },
];
const columns: TableColumn<Person>[] = [{ title: "Name", dataKey: "name" }];

const setup = (props: Partial<Props> = {}) => {
  const onQueryChange = vi.fn();
  const onReload = vi.fn();
  const allProps: Props = {
    menu: { title: "People" },
    data: people,
    hasMore: true,
    isLoading: false,
    onQueryChange,
    onReload,
    columns,
    ...props,
  };
  const view = render(<InfiniteScroll<Person> {...allProps} />);
  const rerender = (next: Partial<Props>) =>
    view.rerender(<InfiniteScroll<Person> {...allProps} {...next} />);
  return { onQueryChange, onReload, rerender };
};

/** A menu with these filters, built once so re-renders keep its identity. */
const withFilters = (...filters: InfiniteScrollMenuFilter[]) => ({
  menu: { title: "People", filters },
});

/** The last query string InfiniteScroll reported, as a plain object. */
const lastQuery = (onQueryChange: Mock) =>
  Object.fromEntries(new URLSearchParams(onQueryChange.mock.lastCall![0]));

const button = (name: string | RegExp) => screen.getByRole("button", { name });
const apply = () => button("Apply");
const region = () => screen.getByRole("region", { name: "People" });

/**
 * jsdom has no layout, so scrollHeight, clientHeight and scrollTop are always
 * 0; stub them on the scroll container to place it.
 */
const placeScroll = (
  el: HTMLElement,
  sizes: { scrollHeight: number; clientHeight: number; scrollTop: number }
) => {
  for (const [key, value] of Object.entries(sizes)) {
    Object.defineProperty(el, key, { value, configurable: true });
  }
};
const scroll = (el: HTMLElement) =>
  act(() => el.dispatchEvent(new Event("scroll")));

const status = (
  selected: number[] = [],
  multiSelect = false
): InfiniteScrollMenuFilter => ({
  type: "SELECT",
  title: "Status",
  dataKey: "status",
  multiSelect,
  options: [
    { id: 1, name: "Active", selected: selected.includes(1) },
    { id: 2, name: "Closed", selected: selected.includes(2) },
    { id: 3, name: "Pending", selected: selected.includes(3) },
  ],
});
const price = (
  startValue?: number,
  endValue?: number
): InfiniteScrollMenuFilter => ({
  type: "RANGE",
  title: "Price",
  dataKey: "price",
  rangeType: "NUMBER",
  startValue,
  endValue,
});
const created = (
  rangeType: "DATE" | "DATETIME",
  startValue?: string
): InfiniteScrollMenuFilter => ({
  type: "RANGE",
  title: "Created",
  dataKey: "createdAt",
  rangeType,
  startValue,
});
const nameSearch = (value?: string): InfiniteScrollMenuFilter => ({
  type: "SEARCH",
  title: "Name",
  dataKey: "name",
  value,
});
const skus = (list = ""): InfiniteScrollMenuFilter => ({
  type: "LIST",
  title: "SKUs",
  dataKey: "sku",
  list,
});

describe("InfiniteScroll", () => {
  describe("rows", () => {
    it("renders a row for each item", () => {
      setup();

      expect(screen.getAllByRole("row")).toHaveLength(people.length + 1);
    });

    it("renders each item's columns", () => {
      setup();

      expect(screen.getByRole("cell", { name: "Bob" })).toBeVisible();
    });

    it("renders dataComponent's nodes instead of a table", () => {
      setup({
        columns: undefined,
        dataComponent: (rows) =>
          rows.map((row) => <p key={row.index}>Card {row.data.name}</p>),
      });

      expect(screen.getByText("Card Cy")).toBeVisible();
    });

    it("refuses both columns and dataComponent", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => setup({ dataComponent: () => [] })).toThrow(
        "You cannot use both columns and dataComponent in the same infinite scroll component"
      );
    });

    it("calls onRowClick with the clicked row's item", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      setup({ onRowClick });

      await user.click(screen.getByRole("cell", { name: "Bob" }));

      expect(onRowClick).toHaveBeenCalledWith(people[1]);
    });

    it("says there are no results when loading finds none", () => {
      setup({ data: [] });

      expect(screen.getByText("No results found")).toBeVisible();
    });

    it("shows the emptyMessage when given", () => {
      setup({ data: [], emptyMessage: "Nobody here" });

      expect(screen.getByText("Nobody here")).toBeVisible();
    });

    it("does not say there are no results while loading", () => {
      setup({ data: [], isLoading: true });

      expect(screen.queryByText("No results found")).not.toBeInTheDocument();
    });
  });

  describe("query", () => {
    it("reports the first page at the default limit on mount", () => {
      const { onQueryChange } = setup();

      expect(onQueryChange).toHaveBeenLastCalledWith("limit=25&offset=0");
    });

    it("reports the menu's limit and sort on mount", () => {
      const menu: InfiniteScrollMenu = {
        title: "People",
        limitOptions: [
          { value: 10, selected: false },
          { value: 40, selected: true },
        ],
        sort: {
          sortDataKeys: [
            { dataKey: "name", displayName: "Name", selected: true },
          ],
          sortDirection: "asc",
        },
      };

      const { onQueryChange } = setup({ menu });

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "40",
        offset: "0",
        sort: "name",
        sortDir: "asc",
      });
    });

    it("reports the menu's preset filters on mount", () => {
      const { onQueryChange } = setup(withFilters(status([2]), price(5)));

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[status]": "2",
        "filter[price_gte]": "5",
      });
    });

    it("reports the first page again when reloadData changes", () => {
      const { onQueryChange, rerender } = setup({ reloadData: false });
      onQueryChange.mockClear();

      rerender({ reloadData: true });

      expect(onQueryChange).toHaveBeenCalledWith("limit=25&offset=0");
    });

    it("applies a new menu's filters", () => {
      const { onQueryChange, rerender } = setup(withFilters(status([1])));

      rerender(withFilters(status([3])));

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[status]": "3",
      });
    });

    it.todo(
      "decide whether mounting should call onReload — currently it does when menu has filters, and not when it has none"
    );
  });

  describe("next page button", () => {
    it("reports the page after the loaded rows", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup();

      await user.click(button("Fetch Next Page"));

      expect(onQueryChange).toHaveBeenLastCalledWith("limit=25&offset=3");
    });

    it("is disabled and says so when there are no more pages", () => {
      setup({ hasMore: false });

      expect(button("No More Pages")).toBeDisabled();
    });

    it("is disabled while the next page loads", () => {
      setup({ isLoading: true });

      expect(button("Loading...")).toBeDisabled();
    });

    it("is not shown with no rows", () => {
      setup({ data: [] });

      expect(
        screen.queryByRole("button", { name: "Fetch Next Page" })
      ).not.toBeInTheDocument();
    });

    it("is not shown with hideNextPageButton", () => {
      setup({ hideNextPageButton: true });

      expect(
        screen.queryByRole("button", { name: "Fetch Next Page" })
      ).not.toBeInTheDocument();
    });
  });

  describe("scrolling", () => {
    // Loads more within 50px of the bottom: with 1000px of content in a
    // 400px box, from a scrollTop of 550.
    it("reports the next page when scrolled to 50px from the bottom", () => {
      const { onQueryChange } = setup();
      placeScroll(region(), {
        scrollHeight: 1000,
        clientHeight: 400,
        scrollTop: 550,
      });
      onQueryChange.mockClear();

      scroll(region());

      expect(onQueryChange).toHaveBeenCalledWith("limit=25&offset=3");
    });

    it("does not load more at 51px from the bottom", () => {
      const { onQueryChange } = setup();
      placeScroll(region(), {
        scrollHeight: 1000,
        clientHeight: 400,
        scrollTop: 549,
      });
      onQueryChange.mockClear();

      scroll(region());

      expect(onQueryChange).not.toHaveBeenCalled();
    });

    it("loads more when the content overflows its box by a pixel", () => {
      const { onQueryChange } = setup();
      placeScroll(region(), {
        scrollHeight: 401,
        clientHeight: 400,
        scrollTop: 0,
      });
      onQueryChange.mockClear();

      scroll(region());

      expect(onQueryChange).toHaveBeenCalledWith("limit=25&offset=3");
    });

    it("does not load more when the content fits its box", () => {
      const { onQueryChange } = setup();
      placeScroll(region(), {
        scrollHeight: 400,
        clientHeight: 400,
        scrollTop: 0,
      });
      onQueryChange.mockClear();

      scroll(region());

      expect(onQueryChange).not.toHaveBeenCalled();
    });

    it.each<[string, Partial<Props>]>([
      ["there are no more pages", { hasMore: false }],
      ["a page is loading", { isLoading: true }],
    ])("does not load more when %s", (_name, props) => {
      const { onQueryChange } = setup(props);
      placeScroll(region(), {
        scrollHeight: 1000,
        clientHeight: 400,
        scrollTop: 600,
      });
      onQueryChange.mockClear();

      scroll(region());

      expect(onQueryChange).not.toHaveBeenCalled();
    });
  });

  describe("sorting", () => {
    const sortMenu = {
      menu: {
        title: "People",
        sort: {
          sortDataKeys: [
            { dataKey: "name", displayName: "Name", selected: false },
            { dataKey: "createdAt", displayName: "Created", selected: true },
          ],
        },
      },
    };

    it("has no sort controls without sort keys", () => {
      setup();

      expect(
        screen.queryByRole("button", { name: /^Sort by/ })
      ).not.toBeInTheDocument();
    });

    it("shows the selected sort key", () => {
      setup(sortMenu);

      expect(button("Sort by: Created")).toBeVisible();
    });

    it("sorts descending by default", () => {
      const { onQueryChange } = setup(sortMenu);

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        sort: "createdAt",
        sortDir: "desc",
      });
    });

    it("keeps Apply disabled until something changes", () => {
      setup(sortMenu);

      expect(apply()).toBeDisabled();
    });

    it("enables Apply once a different key is picked", async () => {
      const user = userEvent.setup();
      setup(sortMenu);
      await user.click(button("Sort by: Created"));

      await user.click(button("Name"));

      expect(apply()).toBeEnabled();
    });

    it("does not report a picked key until it is applied", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(sortMenu);
      await user.click(button("Sort by: Created"));
      onQueryChange.mockClear();

      await user.click(button("Name"));

      expect(onQueryChange).not.toHaveBeenCalled();
    });

    it("reports a picked key on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(sortMenu);
      await user.click(button("Sort by: Created"));
      await user.click(button("Name"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        sort: "name",
        sortDir: "desc",
      });
    });

    it("drops the sort when the selected key is picked again", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(sortMenu);
      await user.click(button("Sort by: Created"));
      await user.click(button("Created"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it("reports a picked direction on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(sortMenu);
      await user.click(button("Sort direction: Descending"));
      await user.click(button("Ascending"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        sort: "createdAt",
        sortDir: "asc",
      });
    });
  });

  describe("page size", () => {
    it("shows the selected page size", () => {
      setup();

      expect(button("Results per page: 25")).toBeVisible();
    });

    it("reports a picked page size on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup();
      await user.click(button("Results per page: 25"));
      await user.click(button("50"));

      await user.click(apply());

      expect(onQueryChange).toHaveBeenLastCalledWith("limit=50&offset=0");
    });

    it("keeps the size when the selected one is picked again", async () => {
      const user = userEvent.setup();
      setup();
      await user.click(button("Results per page: 25"));

      await user.click(button("25"));

      expect(button("Results per page: 25")).toBeVisible();
    });

    it("leaves nothing to apply when the selected size is picked again", async () => {
      const user = userEvent.setup();
      setup();
      await user.click(button("Results per page: 25"));

      await user.click(button("25"));

      expect(apply()).toBeDisabled();
    });
  });

  describe("search filter", () => {
    it("reports typed text on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(nameSearch()));
      await user.type(screen.getByRole("textbox", { name: "Name" }), "ann");

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[name]": "ann",
        "filter[name_op]": "contains",
      });
    });

    it("drops a cleared search on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(nameSearch("ann")));
      await user.click(button("Clear"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it("gets no tag, as its box shows the value", () => {
      setup(withFilters(nameSearch("ann")));

      expect(
        screen.queryByRole("button", { name: "Remove" })
      ).not.toBeInTheDocument();
    });
  });

  describe("select filter", () => {
    it("reports a picked option on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(status()));
      await user.click(button("Status"));
      await user.click(button("Active"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[status]": "1",
      });
    });

    it("replaces the picked option in single-select", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(status([1])));
      await user.click(button("Status"));
      await user.click(button("Closed"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[status]": "2",
      });
    });

    it("reports a multi-select pick with in", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(status([], true)));
      await user.click(button("Status"));
      await user.click(button("Pending"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[status]": "3",
        "filter[status_op]": "in",
      });
    });

    // Bug: two selected options make two tags with the same key, so React
    // warns of duplicate keys (tags/index.tsx).
    it.fails("adds to the picked options in multi-select", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(status([1], true)));
      await user.click(button("Status"));
      await user.click(button("Pending"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[status]": "1,3",
        "filter[status_op]": "in",
      });
    });

    it("drops an option picked again on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(status([1])));
      await user.click(button("Status"));
      await user.click(button("Active"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it("hides options that do not match the option search", async () => {
      const user = userEvent.setup();
      setup(withFilters(status()));
      await user.click(button("Status"));

      await user.type(
        screen.getByRole("textbox", { name: "Search Status options" }),
        "CLO"
      );

      expect(
        screen.queryByRole("button", { name: "Active" })
      ).not.toBeInTheDocument();
    });

    it("keeps options that match the option search, ignoring case", async () => {
      const user = userEvent.setup();
      setup(withFilters(status()));
      await user.click(button("Status"));

      await user.type(
        screen.getByRole("textbox", { name: "Search Status options" }),
        "CLO"
      );

      expect(button("Closed")).toBeVisible();
    });
  });

  describe("range filter", () => {
    it.each([
      ["start", "Price start", { "filter[price_gte]": "5" }],
      ["end", "Price end", { "filter[price_lte]": "5" }],
    ])("reports a number %s on Apply", async (_name, label, expected) => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(price()));
      await user.click(button("Price"));
      await user.type(screen.getByLabelText(label), "5");

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        ...expected,
      });
    });

    it("reports a start of 0", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(price()));
      await user.click(button("Price"));
      await user.type(screen.getByLabelText("Price start"), "0");

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[price_gte]": "0",
      });
    });

    // Bug: clearing a NUMBER field sets parseInt("") — NaN — as the bound,
    // so the query sends filter[price_gte]=NaN.
    it.fails("drops a cleared number bound on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(price(5)));
      await user.click(button("Price"));
      await user.clear(screen.getByLabelText("Price start"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it("reports a date as the UTC instant of local midnight", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(created("DATE")));
      await user.click(button("Created"));
      await user.type(screen.getByLabelText("Created start"), "2024-01-05");

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[createdAt_gte]": new Date(2024, 0, 5).toISOString(),
      });
    });

    it("reports a date and time as a UTC instant", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(created("DATETIME")));
      await user.click(button("Created"));
      await user.type(
        screen.getByLabelText("Created start"),
        "2024-01-05T13:30"
      );

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[createdAt_gte]": new Date(2024, 0, 5, 13, 30).toISOString(),
      });
    });

    it("reports text as typed", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(
        withFilters({ type: "RANGE", title: "Code", dataKey: "code" })
      );
      await user.click(button("Code"));
      await user.type(screen.getByLabelText("Code start"), "m");

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[code_gte]": "m",
      });
    });

    it.each([
      ["DATE", new Date(2024, 0, 5, 13, 30), "2024-01-05"],
      ["DATETIME", new Date(2024, 0, 5, 13, 30), "2024-01-05T13:30"],
    ] as const)(
      "shows a preset %s in local time",
      (rangeType, date, expected) => {
        setup(withFilters(created(rangeType, date.toISOString())));

        expect(screen.getByLabelText("Created start")).toHaveValue(expected);
      }
    );
  });

  describe("list filter", () => {
    const valuesBox = () =>
      screen.getByRole("textbox", { name: "SKUs values" });

    it("reports added values on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(skus()));
      await user.click(button("SKUs"));
      await user.type(valuesBox(), "a1,b2");
      await user.click(button("Add Filter"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({
        limit: "25",
        offset: "0",
        "filter[sku]": "a1,b2",
        "filter[sku_op]": "in",
      });
    });

    it("adds the values on Enter", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus()));
      await user.click(button("SKUs"));

      await user.type(valuesBox(), "a1{Enter}");

      expect(screen.getByText("SKUs: a1")).toBeVisible();
    });

    it("cannot add until the values change", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus()));

      await user.click(button("SKUs"));

      expect(button("Add Filter")).toBeDisabled();
    });
  });

  describe("tags", () => {
    it("shows a tag for a selected option", () => {
      setup(withFilters(status([2])));

      expect(screen.getByText("Status: Closed")).toBeVisible();
    });

    // Bug: every tag of one filter gets the filter's id as its key, so React
    // warns of duplicate keys (tags/index.tsx).
    it.fails("shows a tag for each selected option", () => {
      setup(withFilters(status([1, 3], true)));

      expect(screen.getByText("Status: Pending")).toBeVisible();
    });

    it("removes a selected option's tag", async () => {
      const user = userEvent.setup();
      setup(withFilters(status([2])));

      await user.click(button("Remove"));

      expect(screen.queryByText("Status: Closed")).not.toBeInTheDocument();
    });

    it("drops a removed tag's option on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(status([2])));
      await user.click(button("Remove"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it.each<[string, InfiniteScrollMenuFilter, string]>([
      ["a number start", price(5), "Price Start: 5"],
      ["a number end", price(undefined, 9), "Price End: 9"],
      [
        "a date start",
        created("DATE", new Date(2024, 0, 5).toISOString()),
        `Created After: ${DateTime.local(2024, 1, 5).toFormat("D")}`,
      ],
      [
        "a date end",
        {
          type: "RANGE",
          title: "Created",
          dataKey: "createdAt",
          rangeType: "DATE",
          endValue: new Date(2024, 0, 5).toISOString(),
        },
        `Created Before: ${DateTime.local(2024, 1, 5).toFormat("D")}`,
      ],
      [
        "a string start",
        {
          type: "RANGE",
          title: "Code",
          dataKey: "code",
          rangeType: "STRING",
          startValue: "m",
        },
        "Code Start: m",
      ],
    ])("shows a tag for %s", (_name, filter, text) => {
      setup(withFilters(filter));

      expect(screen.getByText(text)).toBeVisible();
    });

    // Bug: a range with no rangeType (a text input) tags its value as
    // undefined, so the tag reads "Code Start: " (rangeFilterTag.tsx tagValue).
    it.fails("shows the value of a range with no rangeType", () => {
      setup(
        withFilters({
          type: "RANGE",
          title: "Code",
          dataKey: "code",
          startValue: "m",
        })
      );

      expect(screen.getByText("Code Start: m")).toBeVisible();
    });

    // Bug: a bound of 0 is falsy, so it gets no tag (tags/index.tsx) though
    // the query filters on it.
    it.fails("shows a tag for a range start of 0", () => {
      setup(withFilters(price(0)));

      expect(screen.getByText("Price Start: 0")).toBeVisible();
    });

    // Bug: the start and end tags share the filter's id as their key, so
    // React warns of duplicate keys (tags/index.tsx).
    it.fails("shows tags for both ends of a range", () => {
      setup(withFilters(price(5, 9)));

      expect(screen.getByText("Price End: 9")).toBeVisible();
    });

    it("drops a removed range tag's bound on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(price(5)));
      await user.click(button("Remove"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it.each([
      ["a1", "SKUs: a1"],
      ["a1,b2,c3", "SKUs: a1 (+2 more)"],
    ])("shows a tag for the list %s", (list, text) => {
      setup(withFilters(skus(list)));

      expect(screen.getByText(text)).toBeVisible();
    });

    it("drops a removed list tag on Apply", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(withFilters(skus("a1,b2")));
      await user.click(button("Remove"));

      await user.click(apply());

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });
  });

  describe("list tag editor", () => {
    const dialog = () => screen.getByRole("dialog");

    it("lists the values", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus("a1,b2")));

      await user.click(button("Edit SKUs"));

      expect(within(dialog()).getByRole("cell", { name: "b2" })).toBeVisible();
    });

    it("hides values that do not match its search", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus("a1,b2")));
      await user.click(button("Edit SKUs"));

      await user.type(
        within(dialog()).getByRole("textbox", { name: "Search values" }),
        "b"
      );

      expect(
        within(dialog()).queryByRole("cell", { name: "a1" })
      ).not.toBeInTheDocument();
    });

    it("adds new values", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus("a1,b2")));
      await user.click(button("Edit SKUs"));
      await user.type(
        within(dialog()).getByRole("textbox", { name: "Add new values" }),
        "c3"
      );

      await user.click(
        within(dialog()).getByRole("button", { name: "Add values" })
      );

      expect(screen.getByText("SKUs: a1 (+2 more)")).toBeVisible();
    });

    it("cannot add a value already in the list", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus("a1,b2")));
      await user.click(button("Edit SKUs"));

      await user.type(
        within(dialog()).getByRole("textbox", { name: "Add new values" }),
        "b2"
      );

      expect(
        within(dialog()).getByRole("button", { name: "Add values" })
      ).toBeDisabled();
    });

    // Bug: a row's remove button ignores its row and clears the whole list
    // (listFilterTag.tsx handleRemove removes by the "Add new values" text).
    it.fails("removes only the value of the row clicked", async () => {
      const user = userEvent.setup();
      setup(withFilters(skus("a1,b2")));
      await user.click(button("Edit SKUs"));

      await user.click(
        within(dialog()).getByRole("button", { name: "Remove b2" })
      );

      expect(screen.getByText("SKUs: a1")).toBeVisible();
    });
  });

  describe("reset", () => {
    it("is disabled with no active filters", () => {
      setup(withFilters(status()));

      expect(button("Reset")).toBeDisabled();
    });

    it("clears the filters and reports the query without them", async () => {
      const user = userEvent.setup();
      const { onQueryChange } = setup(
        withFilters(
          status([1]),
          price(5, undefined),
          skus("a1"),
          nameSearch("ann")
        )
      );

      await user.click(button("Reset"));

      expect(lastQuery(onQueryChange)).toEqual({ limit: "25", offset: "0" });
    });

    it("empties the search box", async () => {
      const user = userEvent.setup();
      setup(withFilters(nameSearch("ann")));

      await user.click(button("Reset"));

      expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
    });
  });

  describe("row selection", () => {
    const rowBox = (n: number) =>
      screen.getByRole("checkbox", { name: `Select row ${n}` });
    const allBox = () =>
      screen.getByRole("checkbox", { name: "Select all rows" });

    it("reports a selected row", async () => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      setup({ onRowSelect });

      await user.click(rowBox(2));

      expect(onRowSelect).toHaveBeenLastCalledWith([
        { index: 1, data: people[1] },
      ]);
    });

    it("reports no rows when a selected row is unchecked", async () => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      setup({ onRowSelect });
      await user.click(rowBox(2));

      await user.click(rowBox(2));

      expect(onRowSelect).toHaveBeenLastCalledWith([]);
    });

    it("reports every row when all are selected", async () => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      setup({ onRowSelect });

      await user.click(allBox());

      expect(onRowSelect).toHaveBeenLastCalledWith(
        people.map((data, index) => ({ index, data }))
      );
    });

    it("checks every row when all are selected", async () => {
      const user = userEvent.setup();
      setup();

      await user.click(allBox());

      expect(rowBox(3)).toBeChecked();
    });

    it("checks select-all once every row is selected one by one", async () => {
      const user = userEvent.setup();
      setup();
      await user.click(rowBox(1));
      await user.click(rowBox(2));

      await user.click(rowBox(3));

      expect(allBox()).toBeChecked();
    });

    it("clears the selection when select-all is unchecked", async () => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      setup({ onRowSelect });
      await user.click(allBox());

      await user.click(allBox());

      expect(onRowSelect).toHaveBeenLastCalledWith([]);
    });

    it("leaves the other rows selected when one is unchecked after select-all", async () => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      setup({ onRowSelect });
      await user.click(allBox());

      await user.click(rowBox(1));

      expect(onRowSelect).toHaveBeenLastCalledWith([
        { index: 1, data: people[1] },
        { index: 2, data: people[2] },
      ]);
    });

    it("clears the selection when new data arrives", async () => {
      const user = userEvent.setup();
      const onRowSelect = vi.fn();
      const { rerender } = setup({ onRowSelect });
      await user.click(rowBox(1));

      rerender({ onRowSelect, data: [...people] });

      expect(onRowSelect).toHaveBeenLastCalledWith([]);
    });

    it("leaves select-all unchecked with no rows", () => {
      setup({ data: [] });

      expect(allBox()).not.toBeChecked();
    });

    it("has no checkboxes with hideSelectColumn", () => {
      setup({ hideSelectColumn: true });

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
  });

  describe("delete", () => {
    it("has no delete button without onDelete", () => {
      setup();

      expect(
        screen.queryByRole("button", { name: "Delete selected" })
      ).not.toBeInTheDocument();
    });

    it("is disabled with no rows selected", () => {
      setup({ onDelete: vi.fn() });

      expect(button("Delete selected")).toBeDisabled();
    });

    it("passes the selected rows to onDelete once confirmed", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      setup({ onDelete });
      await user.click(screen.getByRole("checkbox", { name: "Select row 3" }));
      await user.click(button("Delete selected"));

      await user.click(button("Delete"));

      expect(onDelete).toHaveBeenCalledWith([{ index: 2, data: people[2] }]);
    });

    it("does not delete when cancelled", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      setup({ onDelete });
      await user.click(screen.getByRole("checkbox", { name: "Select row 3" }));
      await user.click(button("Delete selected"));

      await user.click(button("Cancel"));

      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe("header", () => {
    it("shows the title", () => {
      setup();

      expect(screen.getByText("People")).toBeVisible();
    });

    it("calls onReload on Refresh", async () => {
      const user = userEvent.setup();
      const { onReload } = setup();

      await user.click(button("Refresh"));

      expect(onReload).toHaveBeenCalledOnce();
    });

    it.each([
      ["Download", "onDownload"],
      ["Add new", "onAddNew"],
    ] as const)("calls %s's %s", async (name, prop) => {
      const user = userEvent.setup();
      const handler = vi.fn();
      setup({ [prop]: handler });

      await user.click(button(name));

      expect(handler).toHaveBeenCalledOnce();
    });

    it.each(["Download", "Add new", "More options"])(
      "has no %s button without its prop",
      (name) => {
        setup();

        expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
      }
    );

    it("renders optionsDropdown under More options", () => {
      setup({ optionsDropdown: <button type="button">Export CSV</button> });

      expect(button("Export CSV")).toBeVisible();
    });

    it("hides the header and filters with hideFilters", () => {
      setup({ hideFilters: true });

      expect(
        screen.queryByRole("button", { name: "Refresh" })
      ).not.toBeInTheDocument();
    });

    it("keeps the rows with hideFilters", () => {
      setup({ hideFilters: true });

      expect(screen.getByRole("cell", { name: "Ann" })).toBeVisible();
    });
  });
});
