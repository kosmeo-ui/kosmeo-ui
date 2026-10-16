import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ReactNode, useState } from "react";
import SearchSelect from "../index.js";

type Fruit = { id: string; name: string };

const apple = { id: "a", name: "Apple" };
const banana = { id: "b", name: "Banana" };
const cherry = { id: "c", name: "Cherry" };
const fruits: Fruit[] = [apple, banana, cherry];

/** SearchSelect is controlled: the parent feeds the pick back as `value`. */
const Harness = ({
  initial = null,
  onSelect,
  disabled,
  required,
  placeholder,
  renderOption,
}: {
  initial?: Fruit | null;
  onSelect: (fruit: Fruit) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  renderOption?: (fruit: Fruit) => ReactNode;
}) => {
  const [value, setValue] = useState<Fruit | null>(initial);
  return (
    <>
      <SearchSelect<Fruit>
        label="Fruit"
        value={value}
        options={fruits}
        getOptionLabel={(f) => f.name}
        getOptionKey={(f) => f.id}
        onSelect={(fruit) => {
          setValue(fruit);
          onSelect(fruit);
        }}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        renderOption={renderOption}
      />
      <p>Elsewhere</p>
    </>
  );
};

const setup = (props: Omit<Parameters<typeof Harness>[0], "onSelect"> = {}) => {
  const onSelect = vi.fn();
  render(<Harness {...props} onSelect={onSelect} />);
  return { onSelect, input: screen.getByRole("textbox", { name: "Fruit" }) };
};

/**
 * The options' visible labels. The list has no listbox/option roles, so its
 * rows are found by text.
 */
const shown = () =>
  fruits.map((f) => f.name).filter((name) => screen.queryByText(name) !== null);

/** Runs out the 100ms delay before a blur closes the list. */
const settle = () => act(() => vi.advanceTimersByTimeAsync(100));

// shouldAdvanceTime keeps the clock ticking for Testing Library's own
// setTimeout(0) waits, which it only fast-forwards under Jest.
beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

const newUser = () =>
  userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

describe("SearchSelect", () => {
  it("shows the selected option's label", () => {
    const { input } = setup({ initial: banana });

    expect(input).toHaveValue("Banana");
  });

  it.each([
    ["a default", undefined, "Select..."],
    ["a custom", "Pick a fruit", "Pick a fruit"],
  ])("shows %s placeholder", (_case, placeholder, expected) => {
    const { input } = setup({ placeholder });

    expect(input).toHaveAttribute("placeholder", expected);
  });

  it("is required when the required prop is set", () => {
    const { input } = setup({ required: true });

    expect(input).toBeRequired();
  });

  it("is disabled when the disabled prop is set", () => {
    const { input } = setup({ disabled: true });

    expect(input).toBeDisabled();
  });

  it("does not open when disabled", async () => {
    const user = newUser();
    const { input } = setup({ disabled: true });

    await user.click(input);

    expect(shown()).toEqual([]);
  });

  it("starts closed", () => {
    setup();

    expect(shown()).toEqual([]);
  });

  it("offers every option on focus", async () => {
    const user = newUser();
    const { input } = setup();

    await user.click(input);

    expect(shown()).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it("offers every option on focus, not only the selected one", async () => {
    const user = newUser();
    const { input } = setup({ initial: banana });

    await user.click(input);

    expect(shown()).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it.each([
    ["an", ["Banana"]],
    ["E", ["Apple", "Cherry"]],
    ["  cher  ", ["Cherry"]],
    ["   ", ["Apple", "Banana", "Cherry"]],
  ])("filters by %j, ignoring case and spaces", async (text, expected) => {
    const user = newUser();
    const { input } = setup();

    await user.type(input, text);

    expect(shown()).toEqual(expected);
  });

  it("says when nothing matches", async () => {
    const user = newUser();
    const { input } = setup();

    await user.type(input, "kiwi");

    expect(screen.getByText("No results found")).toBeVisible();
  });

  it("renders rows with renderOption", async () => {
    const user = newUser();
    const { input } = setup({ renderOption: (f) => <b>{f.id}</b> });

    await user.click(input);

    expect(screen.getByText("b")).toBeVisible();
  });

  describe("picking with the mouse", () => {
    it("calls onSelect with the option", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);

      await user.click(screen.getByText("Cherry"));

      expect(onSelect).toHaveBeenCalledWith(cherry);
    });

    it("shows the picked label", async () => {
      const user = newUser();
      const { input } = setup();
      await user.type(input, "ch");

      await user.click(screen.getByText("Cherry"));

      expect(input).toHaveValue("Cherry");
    });

    it("closes the list", async () => {
      const user = newUser();
      const { input } = setup();
      await user.click(input);

      await user.click(screen.getByText("Cherry"));

      expect(shown()).toEqual([]);
    });

    it("keeps focus in the field", async () => {
      const user = newUser();
      const { input } = setup();
      await user.click(input);

      await user.click(screen.getByText("Cherry"));

      expect(input).toHaveFocus();
    });
  });

  describe("keyboard", () => {
    it.each([
      ["{ArrowDown}{Enter}", apple],
      ["{ArrowDown}{ArrowDown}{Enter}", banana],
      ["{ArrowDown}{ArrowDown}{ArrowUp}{Enter}", apple],
      ["{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}", cherry],
      ["{ArrowDown}{ArrowUp}{ArrowUp}{Enter}", apple],
    ])("picks with %s", async (keys, expected) => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);

      await user.keyboard(keys);

      expect(onSelect).toHaveBeenCalledWith(expected);
    });

    it("moves through the filtered options only", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.type(input, "e");

      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

      expect(onSelect).toHaveBeenCalledWith(cherry);
    });

    it("stops at the last filtered option", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.type(input, "an");

      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

      expect(onSelect).toHaveBeenCalledWith(banana);
    });

    it("picks the option under the mouse with Enter", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);
      await user.hover(screen.getByText("Banana"));

      await user.keyboard("{Enter}");

      expect(onSelect).toHaveBeenCalledWith(banana);
    });

    it("picks nothing with Enter before an option is highlighted", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);

      await user.keyboard("{Enter}");

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("picks nothing with Enter when nothing matches", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.type(input, "kiwi");

      await user.keyboard("{ArrowDown}{Enter}");

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("picks nothing with Enter when the highlight is past a shorter list", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);
      await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
      await user.type(input, "an");

      await user.keyboard("{Enter}");

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("forgets the highlight after a pick", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);
      await user.keyboard("{ArrowDown}{Enter}");

      await user.type(input, "{Backspace>5/}{Enter}");

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("reopens when typing after Escape", async () => {
      const user = newUser();
      const { input } = setup();
      await user.click(input);
      await user.keyboard("{Escape}");

      await user.type(input, "ch");

      expect(shown()).toEqual(["Cherry"]);
    });

    it("closes the list with Escape", async () => {
      const user = newUser();
      const { input } = setup();
      await user.click(input);

      await user.keyboard("{Escape}");

      expect(shown()).toEqual([]);
    });

    it("forgets the highlight on Escape", async () => {
      const user = newUser();
      const { input, onSelect } = setup();
      await user.click(input);
      await user.keyboard("{ArrowDown}{ArrowDown}{Escape}");

      await user.type(input, "a{Enter}");

      expect(onSelect).not.toHaveBeenCalled();
    });

    // Bug: typing does not reset highlightedIndex, so after the list
    // shrinks the highlight can sit past its end and ArrowUp stays there.
    it.fails(
      "highlights an option with ArrowUp after the list shrinks",
      async () => {
        const user = newUser();
        const { input, onSelect } = setup();
        await user.click(input);
        await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
        await user.type(input, "an");

        await user.keyboard("{ArrowUp}{Enter}");

        expect(onSelect).toHaveBeenCalledWith(banana);
      }
    );
  });

  describe("leaving without a pick", () => {
    it("closes on a click outside", async () => {
      const user = newUser();
      const { input } = setup();
      await user.click(input);

      await user.click(screen.getByText("Elsewhere"));

      expect(shown()).toEqual([]);
    });

    it("restores the selected label on a click outside", async () => {
      const user = newUser();
      const { input } = setup({ initial: banana });
      await user.clear(input);
      await user.type(input, "ch");

      await user.click(screen.getByText("Elsewhere"));

      expect(input).toHaveValue("Banana");
    });

    it("does not call onSelect on a click outside", async () => {
      const user = newUser();
      const { input, onSelect } = setup({ initial: banana });
      await user.type(input, "ch");

      await user.click(screen.getByText("Elsewhere"));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("restores the selected label once focus leaves", async () => {
      const user = newUser();
      const { input } = setup({ initial: banana });
      await user.clear(input);
      await user.type(input, "ch");

      await user.tab();

      await settle();
      expect(input).toHaveValue("Banana");
    });

    it("closes once focus leaves", async () => {
      const user = newUser();
      const { input } = setup();
      await user.click(input);

      await user.tab();

      await settle();
      expect(shown()).toEqual([]);
    });

    // Bug: the blur's 100ms restore timer is never cancelled, so it closes
    // the list and drops the typed text even after focus has come back.
    it.fails(
      "stays open when focus returns before the blur delay ends",
      async () => {
        const user = newUser();
        const { input } = setup();
        await user.type(input, "ch");
        await user.tab();

        await user.click(input);

        await settle();
        expect(shown()).toEqual(["Cherry"]);
      }
    );
  });

  it("shows a new value from the parent", () => {
    const props = {
      label: "Fruit",
      options: fruits,
      getOptionLabel: (f: Fruit) => f.name,
      getOptionKey: (f: Fruit) => f.id,
      onSelect: () => {},
    };
    const { rerender } = render(
      <SearchSelect<Fruit> {...props} value={apple} />
    );

    rerender(<SearchSelect<Fruit> {...props} value={cherry} />);

    expect(screen.getByRole("textbox", { name: "Fruit" })).toHaveValue(
      "Cherry"
    );
  });
});
