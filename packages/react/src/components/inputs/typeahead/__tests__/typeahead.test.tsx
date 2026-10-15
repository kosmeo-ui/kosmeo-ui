import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
    const { input } = setup();
    await userEvent.type(input, "st");

    const listbox = screen.getByRole("listbox", { name: "City" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Boston",
      "Austin",
    ]);
  });

  it("tracks the highlighted option with aria-activedescendant", async () => {
    const { input } = setup();
    await userEvent.type(input, "st{ArrowDown}{ArrowDown}");

    const austin = screen.getByRole("option", { name: "Austin" });
    expect(input).toHaveAttribute("aria-activedescendant", austin.id);
    expect(austin).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Boston" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("selects the highlighted option with Enter", async () => {
    const { input, onSelect } = setup();
    await userEvent.type(input, "den{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenLastCalledWith(cities[2], undefined);
    expect(input).toHaveValue("Denver");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("selects an option by click", async () => {
    const { input, onSelect } = setup();
    await userEvent.type(input, "bos");
    await userEvent.click(screen.getByRole("option", { name: "Boston" }));
    expect(onSelect).toHaveBeenLastCalledWith(cities[0], expect.anything());
    expect(input).toHaveValue("Boston");
  });

  it("announces when nothing matches", async () => {
    const { input } = setup();
    await userEvent.type(input, "zzz");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No matches found");
  });
});
