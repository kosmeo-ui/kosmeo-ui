import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MultiSelect from "../index.js";

type Fruit = { value: string; name: string };

const apple = { value: "a", name: "Apple" };
const banana = { value: "b", name: "Banana" };
const cherry = { value: "c", name: "Cherry" };
const fruits: Fruit[] = [apple, banana, cherry];

const chip = (name: string) =>
  screen.getByText(name, { selector: ".k-multiselect-selected-item-label" })
    .parentElement!;
// The field's <label> points at a <div>, so open via the arrow button.
const open = () =>
  userEvent.click(screen.getByRole("button", { name: "Show options" }));
const option = (name: string) =>
  within(screen.getByRole("list")).getByText(name).closest("li")!;

describe("MultiSelect", () => {
  it("shows the placeholder, then the selected values", () => {
    const { rerender } = render(
      <MultiSelect options={fruits} labelKey="name" placeholder="Pick" />
    );
    expect(screen.getByText("Pick")).toBeInTheDocument();

    rerender(
      <MultiSelect options={fruits} labelKey="name" value={[apple, cherry]} />
    );
    expect(chip("Apple")).toBeInTheDocument();
    expect(chip("Cherry")).toBeInTheDocument();
  });

  it("toggles options from the dropdown", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Fruit"
        options={fruits}
        labelKey="name"
        value={[apple]}
        onChange={onChange}
      />
    );
    await open();

    await userEvent.click(option("Banana"));
    expect(onChange).toHaveBeenLastCalledWith([apple, banana]);

    await userEvent.click(option("Apple"));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("filters options by the search term", async () => {
    render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
    await open();
    await userEvent.type(
      screen.getByPlaceholderText("Search options..."),
      "an"
    );

    expect(
      within(screen.getByRole("list"))
        .getAllByRole("listitem")
        .map((li) => li.textContent)
    ).toEqual(["Banana"]);
  });

  it("removes a value from its chip", async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={fruits}
        labelKey="name"
        value={[apple, banana]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Apple" }));
    expect(onChange).toHaveBeenCalledWith([banana]);
  });

  describe("re-rendering", () => {
    it("keeps chip elements, and focus, when the value is re-sent", () => {
      const { rerender } = render(
        <MultiSelect options={fruits} labelKey="name" value={[apple, banana]} />
      );
      const before = chip("Apple");
      const remove = screen.getByRole("button", { name: "Remove Apple" });
      remove.focus();

      rerender(
        <MultiSelect options={fruits} labelKey="name" value={[apple, banana]} />
      );
      expect(chip("Apple")).toBe(before);
      expect(remove).toHaveFocus();
    });

    it("keeps the other chips when one is removed", () => {
      const { rerender } = render(
        <MultiSelect options={fruits} labelKey="name" value={[apple, banana]} />
      );
      const bananaChip = chip("Banana");

      rerender(
        <MultiSelect options={fruits} labelKey="name" value={[banana]} />
      );
      expect(chip("Banana")).toBe(bananaChip);
    });

    it("keeps option elements when the selection changes", async () => {
      const { rerender } = render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[]}
          onChange={() => {}}
        />
      );
      await open();
      const appleOption = option("Apple");

      rerender(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[banana]}
          onChange={() => {}}
        />
      );
      expect(option("Apple")).toBe(appleOption);
    });

    it("hides the remove buttons once disabled", () => {
      const value = [apple];
      const { rerender } = render(
        <MultiSelect options={fruits} labelKey="name" value={value} />
      );
      rerender(
        <MultiSelect options={fruits} labelKey="name" value={value} disabled />
      );
      expect(
        screen.queryByRole("button", { name: "Remove Apple" })
      ).not.toBeInTheDocument();
    });

    it("calls the latest onChange", async () => {
      const first = vi.fn();
      const latest = vi.fn();
      const value = [apple];
      const { rerender } = render(
        <MultiSelect
          options={fruits}
          labelKey="name"
          value={value}
          onChange={first}
        />
      );
      rerender(
        <MultiSelect
          options={fruits}
          labelKey="name"
          value={value}
          onChange={latest}
        />
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Remove Apple" })
      );
      expect(latest).toHaveBeenCalledWith([]);
      expect(first).not.toHaveBeenCalled();
    });

    it("renders options that share a label without duplicate keys", async () => {
      const consoleError = vi.spyOn(console, "error");
      const twins = [{ name: "Same" }, { name: "Same" }];
      render(
        <MultiSelect
          label="Twins"
          options={twins}
          labelKey="name"
          value={twins}
        />
      );
      await open();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
