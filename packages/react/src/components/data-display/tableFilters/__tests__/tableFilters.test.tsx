import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InfiniteScrollMenuFilter } from "../../infiniteScroll/types.js";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import TableFilters from "../index.js";
import type { Mock } from "vitest";

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

const preset: InfiniteScrollMenuFilter[] = [
  {
    type: "SELECT",
    title: "Status",
    dataKey: "status",
    multiSelect: true,
    options: [
      { id: "active", name: "Active", selected: true },
      { id: "trial", name: "Trial", selected: false },
    ],
  },
];

const setup = (props: Partial<Parameters<typeof TableFilters>[0]> = {}) => {
  const onChange = vi.fn();
  const view = render(
    <TableFilters filters={filters} onChange={onChange} {...props} />
  );
  const rerender = (next: InfiniteScrollMenuFilter[]) =>
    view.rerender(
      <TableFilters {...props} filters={next} onChange={onChange} />
    );
  return { onChange, rerender };
};

// A copy with the same contents but new identities, as an inline array is.
const copy = (defs: InfiniteScrollMenuFilter[]) =>
  defs.map((f) => structuredClone(f));

const last = (onChange: Mock) => onChange.mock.lastCall![0];
const button = (name: string | RegExp) => screen.getByRole("button", { name });
const option = (name: string) => screen.getByRole("checkbox", { name });
const nameBox = () => screen.getByRole("textbox", { name: "Name" });

describe("TableFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

  it("reports no filters on mount", () => {
    const { onChange } = setup();

    expect(onChange.mock.calls).toEqual([[{}]]);
  });

  it("reports a preset filter on mount", () => {
    const { onChange } = setup({ filters: preset });

    expect(last(onChange)).toEqual({
      "filter[status]": "active",
      "filter[status_op]": "in",
    });
  });

  it("reports ticked options as filter params", async () => {
    const u = user();
    const { onChange } = setup();
    await u.click(button("Status"));
    await u.click(option("Active"));

    await u.click(option("Trial"));
    await wait(0);

    expect(last(onChange)).toEqual({
      "filter[status]": "active,trial",
      "filter[status_op]": "in",
    });
  });

  // shouldAdvanceTime moves the clock with real time too, so the early case
  // keeps a margin before the 400ms pause rather than sitting 1ms short.
  it.each([
    [300, {}],
    [400, { "filter[name]": "Ada", "filter[name_op]": "contains" }],
  ])("reports a search %ims after typing stops", async (ms, expected) => {
    const u = user();
    const { onChange } = setup();
    await u.type(nameBox(), "Ada");

    await wait(ms);

    expect(last(onChange)).toEqual(expected);
  });

  it("reports a search at once on Enter", async () => {
    const u = user();
    const { onChange } = setup();

    await u.type(nameBox(), "Ada{Enter}");

    expect(last(onChange)).toEqual({
      "filter[name]": "Ada",
      "filter[name_op]": "contains",
    });
  });

  it("reports a range only from its menu's Apply button", async () => {
    const u = user();
    const { onChange } = setup();
    await u.click(button("MRR"));
    await u.type(screen.getByLabelText("MRR start"), "100");
    await u.type(screen.getByLabelText("MRR end"), "500");

    await u.click(button("Apply"));
    await wait(0);

    expect(last(onChange)).toEqual({
      "filter[mrr_gte]": "100",
      "filter[mrr_lte]": "500",
    });
  });

  it("reports nothing while a range is typed", async () => {
    const u = user();
    const { onChange } = setup();
    await u.click(button("MRR"));
    await u.type(screen.getByLabelText("MRR start"), "100");

    await wait(1000);

    expect(onChange.mock.calls).toEqual([[{}]]);
  });

  it("keeps the user's filters when re-rendered with an equal new array", async () => {
    const u = user();
    const { rerender } = setup();
    await u.click(button("Status"));
    await u.click(option("Active"));
    await wait(0);

    rerender(copy(filters));

    expect(screen.getByText("Status: Active")).toBeVisible();
  });

  it("starts over when the definitions change", async () => {
    const u = user();
    const { onChange, rerender } = setup();
    await u.click(button("Status"));
    await u.click(option("Active"));
    await wait(0);

    rerender(filters.filter((f) => f.dataKey !== "name"));

    expect(last(onChange)).toEqual({});
  });

  describe("narrow-screen toggle", () => {
    it("starts closed", () => {
      setup();

      expect(button("Filters")).toHaveAttribute("aria-expanded", "false");
    });

    it("opens on click", async () => {
      const u = user();
      setup();

      await u.click(button("Filters"));

      expect(button("Filters")).toHaveAttribute("aria-expanded", "true");
    });

    it("counts the filters that are set", async () => {
      const u = user();
      setup({ filters: [...preset, filters[0]] });

      await u.type(nameBox(), "Ada");

      expect(button("Filters (2)")).toBeVisible();
    });
  });

  describe('applyMode="manual"', () => {
    // Immediate mode would apply these edits on its own a tick later; manual
    // mode shows that removing a tag and Reset apply by themselves.
    it("drops a filter when its tag is removed, without Apply", async () => {
      const u = user();
      const { onChange } = setup({ filters: preset, applyMode: "manual" });

      await u.click(button("Remove"));

      expect(last(onChange)).toEqual({});
    });

    it("clears every filter on Reset, without Apply", async () => {
      const u = user();
      const { onChange } = setup({ filters: preset, applyMode: "manual" });

      await u.click(button("Reset"));

      expect(last(onChange)).toEqual({});
    });

    it("reports nothing until Apply", async () => {
      const u = user();
      const { onChange } = setup({ applyMode: "manual" });
      await u.click(button("Status"));

      await u.click(option("Active"));
      await wait(1000);

      expect(onChange.mock.calls).toEqual([[{}]]);
    });

    it("reports the picks on Apply", async () => {
      const u = user();
      const { onChange } = setup({ applyMode: "manual" });
      await u.click(button("Status"));
      await u.click(option("Active"));

      await u.click(button("Apply"));

      expect(last(onChange)).toEqual({
        "filter[status]": "active",
        "filter[status_op]": "in",
      });
    });
  });
});
