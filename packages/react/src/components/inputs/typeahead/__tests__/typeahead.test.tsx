import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Typeahead from "../index.js";

type City = { id: number; name: string };

const cities: City[] = [
  { id: 1, name: "Boston" },
  { id: 2, name: "Austin" },
  { id: 3, name: "Denver" },
];

const setup = (onSelect = vi.fn()) => {
  render(
    <Typeahead
      label="City"
      options={cities}
      labelKey="name"
      onSelect={onSelect}
    />
  );
  return { onSelect, input: screen.getByRole("combobox", { name: "City" }) };
};

describe("Typeahead", () => {
  it("is a list-autocomplete combobox named by its label", () => {
    const { input } = setup();

    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-controls");
  });

  it("filters into a listbox it controls", async () => {
    const user = userEvent.setup();
    const { input } = setup();

    await user.type(input, "st");

    const listbox = screen.getByRole("listbox", { name: "City" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Boston",
      "Austin",
    ]);
  });

  it("tracks the highlighted option with aria-activedescendant", async () => {
    const user = userEvent.setup();
    const { input } = setup();
    await user.type(input, "st");

    await user.keyboard("{ArrowDown}{ArrowDown}");

    const austin = screen.getByRole("option", { name: "Austin" });
    expect(input).toHaveAttribute("aria-activedescendant", austin.id);
    expect(austin).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Boston" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("selects the highlighted option with Enter", async () => {
    const user = userEvent.setup();
    const { input, onSelect } = setup();
    await user.type(input, "den{ArrowDown}");

    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenLastCalledWith(cities[2], undefined);
    expect(input).toHaveValue("Denver");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("selects an option by click", async () => {
    const user = userEvent.setup();
    const { input, onSelect } = setup();
    await user.type(input, "bos");

    await user.click(screen.getByRole("option", { name: "Boston" }));

    expect(onSelect).toHaveBeenLastCalledWith(cities[0], expect.anything());
    expect(input).toHaveValue("Boston");
  });

  it("announces when nothing matches", async () => {
    const user = userEvent.setup();
    const { input } = setup();

    await user.type(input, "zzz");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No matches found");
  });

  it("selects the highlighted option with Tab", async () => {
    const user = userEvent.setup();
    const { input, onSelect } = setup();
    await user.type(input, "st{ArrowDown}{ArrowDown}");

    await user.tab();

    expect(onSelect).toHaveBeenLastCalledWith(cities[1], undefined);
    expect(input).toHaveValue("Austin");
  });

  describe("lazyLoad", () => {
    /** The callback of the observer watching the "Loading more" sentinel. */
    let reachEnd: () => void;
    beforeEach(() => {
      vi.stubGlobal(
        "IntersectionObserver",
        class {
          constructor(callback: IntersectionObserverCallback) {
            reachEnd = () =>
              act(() =>
                callback(
                  [{ isIntersecting: true } as IntersectionObserverEntry],
                  this as unknown as IntersectionObserver
                )
              );
          }
          observe() {}
          disconnect() {}
        }
      );
    });
    afterEach(() => vi.unstubAllGlobals());

    const many = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `City ${i}`,
    }));

    const renderMany = (showAll: boolean) =>
      render(
        <Typeahead
          label="City"
          options={many}
          labelKey="name"
          onSelect={() => {}}
          lazyLoad={2}
          showAll={showAll}
        />
      );

    /** Opens the list, then reaches its end `times` times. */
    const scroll = async (
      user: ReturnType<typeof userEvent.setup>,
      times: number
    ) => {
      await user.click(screen.getByRole("combobox"));
      for (let i = 0; i < times; i++) reachEnd();
    };

    it.each([
      [false, 0, 2],
      [false, 1, 4],
      [false, 2, 5],
      [true, 0, 2],
      [true, 1, 4],
      [true, 2, 5],
    ])(
      "with showAll %s, shows a page at a time: %i ends reached show %i options",
      async (showAll, times, shown) => {
        const user = userEvent.setup();
        renderMany(showAll);

        await scroll(user, times);

        expect(screen.getAllByRole("option")).toHaveLength(shown);
      }
    );

    it.each([false, true])(
      "with showAll %s, drops the loading row once every option shows",
      async (showAll) => {
        const user = userEvent.setup();
        renderMany(showAll);

        await scroll(user, 2);

        expect(screen.queryByText("Loading more...")).not.toBeInTheDocument();
      }
    );
  });
});
