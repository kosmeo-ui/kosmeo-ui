import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UseQueryResult } from "@tanstack/react-query";
import SearchList from "../index.js";
import { useState } from "react";

type City = { id: number; name: string };

const cities: City[] = [
  { id: 1, name: "Boston" },
  { id: 2, name: "Bossier City" },
  { id: 3, name: "Denver" },
];

/** Stands in for a useQuery hook: filters `cities` by the search term. */
const searchCities = (loading = false) =>
  ((input: string) => ({
    data: input
      ? cities.filter((c) => c.name.toLowerCase().includes(input.toLowerCase()))
      : undefined,
    isLoading: loading && input !== "",
  })) as unknown as (input: string) => UseQueryResult<City[], Error>;

/** SearchList is controlled: the parent feeds the selection back as `value`. */
const Harness = ({
  initialOptions,
  loading,
  onSelect,
}: {
  initialOptions?: City[];
  loading?: boolean;
  onSelect: (city: City | null, event?: React.MouseEvent) => void;
}) => {
  const [value, setValue] = useState<City | null>(null);
  return (
    <SearchList<City>
      id="city"
      label="City"
      labelKey="name"
      searchKey="name"
      queryFn={searchCities(loading)}
      value={value}
      onSelect={(city, event) => {
        setValue(city);
        onSelect(city, event);
      }}
      initialOptions={initialOptions}
    />
  );
};

const setup = ({
  initialOptions,
  loading,
}: { initialOptions?: City[]; loading?: boolean } = {}) => {
  const onSelect = vi.fn();
  render(
    <Harness
      initialOptions={initialOptions}
      loading={loading}
      onSelect={onSelect}
    />
  );
  return { onSelect, input: screen.getByRole("combobox", { name: "City" }) };
};

type User = ReturnType<typeof userEvent.setup>;

/** Runs out SearchList's 500ms search debounce. */
const settle = () => act(() => vi.advanceTimersByTimeAsync(500));

/** Types a search and waits out the debounce, so its results show. */
const search = async (user: User, input: HTMLElement, text: string) => {
  await user.type(input, text);
  await settle();
};

// shouldAdvanceTime keeps the clock ticking for Testing Library's own
// setTimeout(0) waits, which it only fast-forwards under Jest.
beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe("SearchList", () => {
  it("is a list-autocomplete combobox named by its label", () => {
    const { input } = setup();

    expect(input).toHaveAttribute("id", "city");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("offers initial options in a listbox on focus", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup({ initialOptions: [cities[2]] });

    await user.click(input);

    const listbox = screen.getByRole("listbox", { name: "City" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Denver",
    ]);
  });

  it("prompts with a status when there's nothing to offer yet", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup();

    await user.click(input);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Start typing to search"
    );
  });

  it("lists search results", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup();

    await search(user, input, "bos");

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Boston",
      "Bossier City",
    ]);
  });

  it("highlights a result from the keyboard", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup();
    await search(user, input, "bos");

    await user.keyboard("{ArrowDown}{ArrowDown}");

    const bossier = screen.getByRole("option", { name: "Bossier City" });
    expect(input).toHaveAttribute("aria-activedescendant", bossier.id);
    expect(bossier).toHaveAttribute("aria-selected", "true");
  });

  it("picks the highlighted result with Enter", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, onSelect } = setup();
    await search(user, input, "bos");
    await user.keyboard("{ArrowDown}{ArrowDown}");

    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenLastCalledWith(cities[1], undefined);
    expect(input).toHaveValue("Bossier City");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("announces when nothing matches", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup();

    await search(user, input, "zzz");

    expect(screen.getByRole("status")).toHaveTextContent("No results found");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // Past the debounce, the query is loading but still holds the last results.
  it("shows a loading status in place of the results while loading", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup({ loading: true });

    await search(user, input, "bos");

    expect(screen.getByRole("status", { name: "Loading..." })).toBeVisible();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("can't highlight hidden results while loading", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup({ loading: true });
    await search(user, input, "bos");

    await user.keyboard("{ArrowDown}");

    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("can't pick hidden results while loading", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input, onSelect } = setup({ loading: true });
    await search(user, input, "bos");
    await user.keyboard("{ArrowDown}");

    await user.keyboard("{Enter}");

    expect(onSelect).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      undefined
    );
  });

  it("drops the highlight when the search changes", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup();
    await search(user, input, "bos");
    await user.keyboard("{ArrowDown}{ArrowDown}");

    // "bost" leaves one result, so the old second-row highlight is gone.
    await search(user, input, "t");

    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { input } = setup();
    await search(user, input, "bos");

    await user.keyboard("{Escape}");

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  describe("uncontrolled, with no value prop", () => {
    const setupUncontrolled = () => {
      const onSelect = vi.fn();
      render(
        <SearchList<City>
          label="City"
          labelKey="name"
          searchKey="name"
          queryFn={searchCities()}
          onSelect={onSelect}
        />
      );
      return {
        onSelect,
        input: screen.getByRole("combobox", { name: "City" }),
      };
    };

    /** Searches "bos", picks Boston and waits out the debounce. */
    const pickBoston = async (user: User, input: HTMLElement) => {
      await search(user, input, "bos");
      await user.keyboard("{ArrowDown}{Enter}");
      await settle();
    };

    it("stays closed after a pick", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { input, onSelect } = setupUncontrolled();
      await search(user, input, "bos");
      await user.keyboard("{ArrowDown}");

      await user.keyboard("{Enter}");
      // The picked label must not count as a new search once debounced.
      await settle();

      expect(onSelect).toHaveBeenLastCalledWith(cities[0], undefined);
      expect(input).toHaveValue("Boston");
      expect(input).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("reports no selection when the input is cleared", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { input, onSelect } = setupUncontrolled();
      await pickBoston(user, input);

      await user.clear(input);
      await settle();

      expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it("treats the old label as a fresh search once cleared", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { input } = setupUncontrolled();
      await pickBoston(user, input);
      await user.clear(input);
      await settle();

      await search(user, input, "Boston");

      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
        "Boston",
      ]);
    });
  });
});
