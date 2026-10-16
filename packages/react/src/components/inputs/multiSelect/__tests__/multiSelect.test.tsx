import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MultiSelect from "../index.js";

type Fruit = { value: string; name: string };

const apple = { value: "a", name: "Apple" };
const banana = { value: "b", name: "Banana" };
const cherry = { value: "c", name: "Cherry" };
const fruits: Fruit[] = [apple, banana, cherry];

/** A selected value's chip label, inside the combobox. */
const chip = (name: string) =>
  within(screen.getByRole("combobox")).getByText(name);
/**
 * A chip's mouse-only remove button. It is aria-hidden, and Testing Library
 * computes no accessible name for a hidden element, so `getByRole` with
 * `hidden: true` cannot match it by name; its aria-label still finds it.
 */
const removeButton = (name: string) => screen.getByLabelText(`Remove ${name}`);
const option = (name: string) => screen.getByRole("option", { name });
const searchBox = () => screen.getByRole("textbox", { name: "Search options" });

describe("MultiSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<MultiSelect options={fruits} labelKey="name" placeholder="Pick" />);

    expect(screen.getByText("Pick")).toBeVisible();
  });

  it("shows a chip for each selected value", () => {
    render(
      <MultiSelect options={fruits} labelKey="name" value={[apple, cherry]} />
    );

    expect(chip("Apple")).toBeVisible();
    expect(chip("Cherry")).toBeVisible();
  });

  it("adds an unselected option when it is clicked", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole("combobox"));

    await user.click(option("Banana"));

    expect(onChange).toHaveBeenLastCalledWith([apple, banana]);
  });

  it("removes a selected option when it is clicked", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole("combobox"));

    await user.click(option("Apple"));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("filters options by the search term", async () => {
    const user = userEvent.setup();
    render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
    await user.click(screen.getByRole("combobox"));

    await user.type(searchBox(), "an");

    expect(screen.getAllByRole("option").map((li) => li.textContent)).toEqual([
      "Banana",
    ]);
  });

  it("removes a value from its chip", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={fruits}
        labelKey="name"
        value={[apple, banana]}
        onChange={onChange}
      />
    );

    await user.click(removeButton("Apple"));

    expect(onChange).toHaveBeenCalledWith([banana]);
  });

  describe("re-rendering", () => {
    it("keeps chip elements, and focus, when the value is re-sent", () => {
      const { rerender } = render(
        <MultiSelect options={fruits} labelKey="name" value={[apple, banana]} />
      );
      const before = chip("Apple");
      const remove = removeButton("Apple");
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
      const user = userEvent.setup();
      const { rerender } = render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[]}
          onChange={() => {}}
        />
      );
      await user.click(screen.getByRole("combobox"));
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

      expect(screen.queryByLabelText("Remove Apple")).not.toBeInTheDocument();
    });

    it("calls the latest onChange", async () => {
      const user = userEvent.setup();
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

      await user.click(removeButton("Apple"));

      expect(latest).toHaveBeenCalledWith([]);
      expect(first).not.toHaveBeenCalled();
    });

    it("renders options that share a label without duplicate keys", async () => {
      const user = userEvent.setup();
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

      await user.click(screen.getByRole("combobox"));

      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("is a combobox named by its label", () => {
      render(
        <MultiSelect label="Fruit" options={fruits} labelKey="name" required />
      );

      const combobox = screen.getByRole("combobox", { name: "Fruit" });
      expect(combobox).toHaveAttribute("aria-haspopup", "listbox");
      expect(combobox).toHaveAttribute("aria-expanded", "false");
      expect(combobox).toHaveAttribute("aria-required", "true");
    });

    it("is named by its placeholder without a label", () => {
      render(
        <MultiSelect options={fruits} labelKey="name" placeholder="Fruits" />
      );

      expect(screen.getByRole("combobox", { name: "Fruits" })).toBeVisible();
    });

    it("controls a multi-select listbox reporting each option's selection", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[banana]}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = screen.getByRole("listbox", { name: "Fruit" });
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-controls",
        listbox.id
      );
      expect(option("Banana")).toHaveAttribute("aria-selected", "true");
      expect(option("Apple")).toHaveAttribute("aria-selected", "false");
    });

    it.each(["{Enter}", " ", "{ArrowDown}"])("opens with %j", async (key) => {
      const user = userEvent.setup();
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      await user.tab();

      await user.keyboard(key);

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(searchBox()).toHaveFocus();
    });

    it("highlights options from the keyboard", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[]}
          onChange={() => {}}
        />
      );
      await user.tab();
      await user.keyboard("{Enter}");

      await user.keyboard("{ArrowDown}{ArrowDown}");

      expect(searchBox()).toHaveAttribute(
        "aria-activedescendant",
        option("Banana").id
      );
    });

    it("picks the highlighted option with Enter", async () => {
      const user = userEvent.setup();
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
      await user.tab();
      await user.keyboard("{Enter}{ArrowDown}{ArrowDown}");

      await user.keyboard("{Enter}");

      expect(onChange).toHaveBeenCalledWith([banana]);
    });

    it("closes on Escape and returns focus to the combobox", async () => {
      const user = userEvent.setup();
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      await user.tab();
      await user.keyboard("{Enter}");

      await user.keyboard("{Escape}");

      const combobox = screen.getByRole("combobox");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(combobox).toHaveAttribute("aria-expanded", "false");
      expect(combobox).toHaveFocus();
    });

    it("keeps focus in the search box when an option is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect
          label="Fruit"
          options={fruits}
          labelKey="name"
          value={[]}
          onChange={() => {}}
        />
      );
      await user.click(screen.getByRole("combobox"));

      await user.click(option("Apple"));

      expect(searchBox()).toHaveFocus();
    });

    it("is aria-disabled when disabled", () => {
      render(
        <MultiSelect label="Fruit" options={fruits} labelKey="name" disabled />
      );

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-disabled",
        "true"
      );
    });

    it("won't open from the keyboard while disabled", async () => {
      const user = userEvent.setup();
      render(
        <MultiSelect label="Fruit" options={fruits} labelKey="name" disabled />
      );
      // Out of the tab order while disabled, so focused directly.
      screen.getByRole("combobox").focus();

      await user.keyboard("{Enter}");

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    });

    it("keeps chip remove buttons out of the tab order", () => {
      render(<MultiSelect options={fruits} labelKey="name" value={[apple]} />);

      const remove = removeButton("Apple");
      expect(remove).toHaveAttribute("tabindex", "-1");
      expect(remove).toHaveAttribute("aria-hidden", "true");
    });

    it("announces when no options match", async () => {
      const user = userEvent.setup();
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      await user.click(screen.getByRole("combobox"));

      await user.type(searchBox(), "zzz");

      expect(screen.queryByRole("option")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("No options found");
    });

    it("stays open when Tab moves focus within the dropdown", async () => {
      const user = userEvent.setup();
      render(
        <>
          <MultiSelect label="Fruit" options={fruits} labelKey="name" />
          <button>Next field</button>
        </>
      );
      await user.tab();
      await user.keyboard("{Enter}");

      await user.tab();

      expect(screen.getByRole("button", { name: "Select all" })).toHaveFocus();
      expect(screen.getByRole("listbox")).toBeVisible();
    });

    it("closes when focus moves outside it", async () => {
      const user = userEvent.setup();
      render(
        <>
          <MultiSelect label="Fruit" options={fruits} labelKey="name" />
          <button>Next field</button>
        </>
      );
      await user.tab();
      await user.keyboard("{Enter}");
      await user.tab();

      await user.tab();

      expect(screen.getByRole("button", { name: "Next field" })).toHaveFocus();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    });

    it("stays open when a non-focusable part of the dropdown is clicked", async () => {
      const user = userEvent.setup();
      render(<MultiSelect label="Fruit" options={fruits} labelKey="name" />);
      await user.click(screen.getByRole("combobox"));

      await user.click(screen.getByRole("listbox"));

      expect(screen.getByRole("listbox")).toBeVisible();
    });
  });
});
