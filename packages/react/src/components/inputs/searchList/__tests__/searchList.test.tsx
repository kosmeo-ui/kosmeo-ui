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
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  return {
    user,
    onSelect,
    input: screen.getByRole("combobox", { name: "City" }),
  };
};

/** Runs out SearchList's 500ms search debounce. */
const settle = () => act(() => vi.advanceTimersByTimeAsync(500));

/** Types a search and waits out the debounce, so its results show. */
const search = async (
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLElement,
  text: string
) => {
  await user.type(input, text);
  await settle();
  expect(screen.getByRole("listbox")).toBeInTheDocument();
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
    const { user, input } = setup({ initialOptions: [cities[2]] });
    await user.click(input);

    const listbox = screen.getByRole("listbox", { name: "City" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Denver",
    ]);
  });

  it("prompts with a status when there's nothing to offer yet", async () => {
    const { user, input } = setup();
    await user.click(input);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Start typing to search"
    );
  });

  it("lists search results", async () => {
    const { user, input } = setup();
    await search(user, input, "bos");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Boston",
      "Bossier City",
    ]);
  });

  it("picks a result from the keyboard", async () => {
    const { user, input, onSelect } = setup();
    await search(user, input, "bos");
    await user.keyboard("{ArrowDown}{ArrowDown}");

    const bossier = screen.getByRole("option", { name: "Bossier City" });
    expect(input).toHaveAttribute("aria-activedescendant", bossier.id);
    expect(bossier).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(cities[1], undefined);
    expect(input).toHaveValue("Bossier City");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("announces when nothing matches", async () => {
    const { user, input } = setup();
    await user.type(input, "zzz");
    await settle();
    expect(screen.getByRole("status")).toHaveTextContent("No results found");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("can't pick hidden results while loading", async () => {
    const { user, input, onSelect } = setup({ loading: true });
    await user.type(input, "bos");
    // Past the debounce, the query is loading but still holds the last results.
    await settle();
    expect(screen.getByRole("status", { name: "Loading..." })).toBeVisible();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(onSelect).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      undefined
    );
  });

  it("drops the highlight when the search changes", async () => {
    const { user, input } = setup();
    await search(user, input, "bos");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    await user.type(input, "t");

    // "bost" leaves one result, so the old second-row highlight is gone.
    await settle();
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("closes on Escape", async () => {
    const { user, input } = setup();
    await search(user, input, "bos");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
