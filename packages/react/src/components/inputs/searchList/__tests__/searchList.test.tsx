import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UseQueryResult } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
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

/** Types past the 500ms debounce, until results replace the spinner. */
const search = async (input: HTMLElement, text: string) => {
  await userEvent.type(input, text);
  await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
};

describe("SearchList", () => {
  it("is a list-autocomplete combobox named by its label", () => {
    const { input } = setup();
    expect(input).toHaveAttribute("id", "city");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("offers initial options in a listbox on focus", async () => {
    const { input } = setup({ initialOptions: [cities[2]] });
    await userEvent.click(input);

    const listbox = screen.getByRole("listbox", { name: "City" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Denver",
    ]);
  });

  it("prompts with a status when there's nothing to offer yet", async () => {
    const { input } = setup();
    await userEvent.click(input);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Start typing to search"
    );
  });

  it("lists search results", async () => {
    const { input } = setup();
    await search(input, "bos");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Boston",
      "Bossier City",
    ]);
  });

  it("picks a result from the keyboard", async () => {
    const { input, onSelect } = setup();
    await search(input, "bos");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    const bossier = screen.getByRole("option", { name: "Bossier City" });
    expect(input).toHaveAttribute("aria-activedescendant", bossier.id);
    expect(bossier).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(cities[1], undefined);
    expect(input).toHaveValue("Bossier City");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("announces when nothing matches", async () => {
    const { input } = setup();
    await userEvent.type(input, "zzz");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("No results found")
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("can't pick hidden results while loading", async () => {
    const { input, onSelect } = setup({ loading: true });
    await userEvent.type(input, "bos");
    // Past the debounce, the query is loading but still holds the last results.
    await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
    expect(screen.getByRole("status", { name: "Loading..." })).toBeVisible();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(onSelect).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      undefined
    );
  });

  it("drops the highlight when the search changes", async () => {
    const { input } = setup();
    await search(input, "bos");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await userEvent.type(input, "t");

    // "bost" leaves one result, so the old second-row highlight is gone.
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });
});
