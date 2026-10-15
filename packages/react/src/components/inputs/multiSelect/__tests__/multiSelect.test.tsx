import { render, screen } from "@testing-library/react";
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
const open = () => userEvent.click(screen.getByRole("combobox"));
const option = (name: string) => screen.getByRole("option", { name });

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

    expect(screen.getAllByRole("option").map((li) => li.textContent)).toEqual([
      "Banana",
    ]);
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
    await userEvent.click(chip("Apple").querySelector("button")!);
    expect(onChange).toHaveBeenCalledWith([banana]);
  });

  describe("re-rendering", () => {
    it("keeps chip elements, and focus, when the value is re-sent", () => {
      const { rerender } = render(
        <MultiSelect options={fruits} labelKey="name" value={[apple, banana]} />
      );
      const before = chip("Apple");
      const remove = chip("Apple").querySelector("button")!;
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
      expect(chip("Apple").querySelector("button")).toBeNull();
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
      await userEvent.click(chip("Apple").querySelector("button")!);
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

  describe("accessibility", () => {
    it("is a combobox named by its label", () => {
      render(
        <MultiSelect label="Fruit" options={fruits} labelKey="name" required />
      );
      const combobox = screen.getByRole("combobox", { name: "Fruit*" });
      expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
      expect(combobox).toHaveAttribute("aria-expanded", "false");
      expect(combobox).toHaveAttribute("aria-required", "true");
    });

    it("is named by its placeholder without a label", () => {
      render(
        <MultiSelect options={fruits} labelKey="name" placeholder="Fruits" />
      );
      expect(
        screen.getByRole("combobox", { name: "Fruits" })
      ).toBeInTheDocument();
    });

    it("controls a multi-select listbox reporting each option's selection", async () => {
      render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[banana]}
        />
      );
      await open();
      const listbox = screen.getByRole("listbox", { name: "Fruit" });
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-controls",
        listbox.id
      );
      expect(option("Banana")).toHaveAttribute("aria-selected", "true");
      expect(option("Apple")).toHaveAttribute("aria-selected", "false");
    });

    it.each(["{Enter}", " ", "{ArrowDown}"])("opens with %s", async (key) => {
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      screen.getByRole("combobox").focus();
      await userEvent.keyboard(key);

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByPlaceholderText("Search options...")).toHaveFocus();
    });

    it("picks options from the keyboard", async () => {
      const onChange = vi.fn();
      render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[]}
          onChange={onChange}
        />
      );
      screen.getByRole("combobox").focus();
      await userEvent.keyboard("{Enter}{ArrowDown}{ArrowDown}");

      const search = screen.getByPlaceholderText("Search options...");
      expect(search).toHaveAttribute(
        "aria-activedescendant",
        option("Banana").id
      );
      expect(option("Banana")).toHaveClass("k-multiselect-option-highlighted");

      await userEvent.keyboard("{Enter}");
      expect(onChange).toHaveBeenCalledWith([banana]);
    });

    it("closes on Escape and returns focus to the combobox", async () => {
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      const combobox = screen.getByRole("combobox");
      combobox.focus();
      await userEvent.keyboard("{Enter}{Escape}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(combobox).toHaveAttribute("aria-expanded", "false");
      expect(combobox).toHaveFocus();
    });

    it("keeps focus in the search box when an option is clicked", async () => {
      render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[]}
          onChange={() => {}}
        />
      );
      await open();
      await userEvent.click(option("Apple"));
      expect(screen.getByPlaceholderText("Search options...")).toHaveFocus();
    });

    it("won't open from the keyboard while disabled", async () => {
      render(
        <MultiSelect label="Fruit" options={fruits} labelKey="name" disabled />
      );
      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-disabled", "true");
      combobox.focus();
      await userEvent.keyboard("{Enter}");
      expect(combobox).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps chip remove buttons out of the tab order", () => {
      render(<MultiSelect options={fruits} labelKey="name" value={[apple]} />);
      const remove = chip("Apple").querySelector("button")!;
      expect(remove).toHaveAttribute("tabindex", "-1");
      expect(remove).toHaveAttribute("aria-hidden", "true");
    });

    it("announces when no options match", async () => {
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      await open();
      await userEvent.type(
        screen.getByPlaceholderText("Search options..."),
        "zzz"
      );
      expect(screen.queryAllByRole("option")).toHaveLength(0);
      expect(screen.getByRole("status")).toHaveTextContent("No options found");
    });

    it("closes when focus moves outside it", async () => {
      render(
        <>
          <MultiSelect label="Fruit" options={fruits} labelKey="name" />
          <button>Next field</button>
        </>
      );
      screen.getByRole("combobox").focus();
      await userEvent.keyboard("{Enter}");

      await userEvent.tab();
      expect(screen.getByRole("button", { name: "Select all" })).toHaveFocus();
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await userEvent.tab();
      expect(screen.getByRole("button", { name: "Next field" })).toHaveFocus();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    });

    it("stays open when a non-focusable part of the dropdown is clicked", async () => {
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      await open();
      await userEvent.click(document.querySelector(".k-multiselect-dropdown")!);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });
});
