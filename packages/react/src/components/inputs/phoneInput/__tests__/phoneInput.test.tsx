import { hydrate, serverRender } from "../../__tests__/hydration.js";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CountryCode } from "libphonenumber-js";
import PhoneInput from "../index.js";
import { useState } from "react";

const Harness = ({
  initialValue = "",
  defaultCountry,
  disabled,
  onChange = () => {},
}: {
  initialValue?: string;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <PhoneInput
        label="Phone"
        value={value}
        defaultCountry={defaultCountry}
        disabled={disabled}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
      <button type="button" onClick={() => setValue("")}>
        Reset
      </button>
    </>
  );
};

const field = () => screen.getByRole("textbox", { name: "Phone" });
const countryButton = () =>
  screen.getByRole("button", { name: /, change country$/ });
const searchBox = () =>
  screen.getByRole("textbox", { name: "Search country or code" });
const optionNames = () =>
  screen
    .getAllByRole("option")
    .map((option) => within(option).getByText(/^\p{L}/u).textContent);

describe("PhoneInput", () => {
  describe("field", () => {
    it("is named by its label", () => {
      render(<Harness />);

      expect(field()).toBeVisible();
    });

    it("shows an example number as the default placeholder", () => {
      render(<Harness />);

      expect(field()).toHaveAttribute("placeholder", "(555) 555-5555");
    });

    it("shows a custom placeholder", () => {
      render(
        <PhoneInput label="Phone" placeholder="Mobile" onChange={() => {}} />
      );

      expect(field()).toHaveAttribute("placeholder", "Mobile");
    });

    it("asks the browser to autofill a national number", () => {
      render(<Harness />);

      expect(field()).toHaveAttribute("autocomplete", "tel-national");
    });

    it("disables the field when disabled", () => {
      render(<Harness disabled />);

      expect(field()).toBeDisabled();
    });

    it("disables the country button when disabled", () => {
      render(<Harness disabled />);

      expect(countryButton()).toBeDisabled();
    });
  });

  describe("initial country", () => {
    it("is the United States by default", () => {
      render(<Harness />);

      expect(countryButton()).toHaveAccessibleName(
        "+1 United States, change country"
      );
    });

    it("is defaultCountry when there is no value", () => {
      render(<Harness defaultCountry="GB" />);

      expect(countryButton()).toHaveAccessibleName(
        "+44 United Kingdom, change country"
      );
    });

    it("comes from the value's country over defaultCountry", () => {
      render(<Harness initialValue="+12015550123" defaultCountry="GB" />);

      expect(countryButton()).toHaveAccessibleName(
        "+1 United States, change country"
      );
    });
  });

  describe("value", () => {
    it.each([
      ["+12015550123", "(201) 555-0123"],
      ["+442071838750", "020 7183 8750"],
    ])("shows %s as a national number", (value, display) => {
      render(<Harness initialValue={value} />);

      expect(field()).toHaveValue(display);
    });

    it("shows a number with no assigned country as typed", () => {
      render(<Harness initialValue="+15555555555" />);

      expect(field()).toHaveValue("(555) 555-5555");
    });

    it("empties the field when the form resets after typing", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(field(), "2015550123");

      await user.click(screen.getByRole("button", { name: "Reset" }));

      expect(field()).toHaveValue("");
    });

    // Bug: a value shown from props is never recorded as last emitted, so a
    // reset to "" matches the initial "" and the old number stays.
    it.fails("empties the field when the parent clears the value", () => {
      const { rerender } = render(
        <PhoneInput label="Phone" value="+12015550123" onChange={() => {}} />
      );

      rerender(<PhoneInput label="Phone" value="" onChange={() => {}} />);

      expect(field()).toHaveValue("");
    });
  });

  describe("typing", () => {
    it.each([
      ["201", "(201)"],
      ["201555", "(201) 555"],
      ["2015550123", "(201) 555-0123"],
    ])("formats %s as %s", async (typed, display) => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(field(), typed);

      expect(field()).toHaveValue(display);
    });

    it.each([
      ["201555", "+1201555"],
      ["2015550123", "+12015550123"],
    ])("reports %s as %s", async (typed, e164) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);

      await user.type(field(), typed);

      expect(onChange).toHaveBeenLastCalledWith(e164);
    });

    it("reports a number in the selected country's code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness defaultCountry="GB" onChange={onChange} />);

      await user.type(field(), "02071838750");

      expect(onChange).toHaveBeenLastCalledWith("+442071838750");
    });

    it("reports an empty value when the field is cleared", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness initialValue="+12015550123" onChange={onChange} />);

      await user.clear(field());

      expect(onChange).toHaveBeenLastCalledWith("");
    });

    it("empties the field when the user clears it", async () => {
      const user = userEvent.setup();
      render(<Harness initialValue="+12015550123" />);

      await user.clear(field());

      expect(field()).toHaveValue("");
    });
  });

  describe("pasting a number with a + prefix", () => {
    it("reports a number in the selected country as E.164", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.click(field());

      await user.paste("+1 201 555 0123");

      expect(onChange).toHaveBeenLastCalledWith("+12015550123");
    });

    it("reports a number from another country in its own code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.click(field());

      await user.paste("+44 20 7183 8750");

      expect(onChange).toHaveBeenLastCalledWith("+442071838750");
    });

    it("switches to a pasted number's country", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(field());

      await user.paste("+44 20 7183 8750");

      expect(countryButton()).toHaveAccessibleName(
        "+44 United Kingdom, change country"
      );
    });
  });

  describe("country picker", () => {
    it("opens a list of countries", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(countryButton());

      expect(screen.getByRole("listbox")).toBeVisible();
    });

    it("marks the country button expanded while open", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(countryButton());

      expect(countryButton()).toHaveAttribute("aria-expanded", "true");
    });

    it("focuses the search box when it opens", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(countryButton());

      expect(searchBox()).toHaveFocus();
    });

    it("lists favourite countries first", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(countryButton());

      expect(optionNames().slice(0, 9)).toEqual([
        "United States",
        "Canada",
        "United Kingdom",
        "Mexico",
        "Australia",
        "Germany",
        "France",
        "Japan",
        "Afghanistan",
      ]);
    });

    it("marks the current country selected", async () => {
      const user = userEvent.setup();
      render(<Harness defaultCountry="CA" />);

      await user.click(countryButton());

      expect(screen.getByRole("option", { name: /Canada/ })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("closes when the country button is clicked again", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());

      await user.click(countryButton());

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("closes on a click outside", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());

      await user.click(document.body);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("does not open when disabled", async () => {
      const user = userEvent.setup();
      render(<Harness disabled />);

      await user.click(countryButton());

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it.each([
      ["canad", ["Canada"]],
      ["  JP  ", ["Japan"]],
      ["+380", ["Ukraine"]],
    ])("filters by name, ISO code or dial code: %j", async (query, names) => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());

      await user.type(searchBox(), query);

      expect(optionNames()).toEqual(names);
    });

    it.todo(
      'decide whether a dial-code search matches only codes that start with it — currently "+44" also lists Angola (+244)'
    );

    it("says so when no country matches", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());

      await user.type(searchBox(), "zzz");

      expect(screen.getByText("No matches")).toBeVisible();
    });

    it("clears the search when it closes", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());
      await user.type(searchBox(), "canad");
      await user.click(countryButton());

      await user.click(countryButton());

      expect(searchBox()).toHaveValue("");
    });
  });

  describe("choosing a country", () => {
    it("shows the chosen country on the button", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());

      await user.click(screen.getByRole("option", { name: /Canada/ }));

      expect(countryButton()).toHaveAccessibleName("+1 Canada, change country");
    });

    it("closes the list", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(countryButton());

      await user.click(screen.getByRole("option", { name: /Canada/ }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("reports the typed number in the new country's code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.type(field(), "2071838750");
      await user.click(countryButton());

      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(onChange).toHaveBeenLastCalledWith("+442071838750");
    });

    it("reports an empty value when nothing is typed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.click(countryButton());

      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(onChange).toHaveBeenCalledWith("");
    });

    // Bug: the pasted "+1" is kept as national digits, so this reports
    // "+4412015550123".
    it.fails("drops a pasted number's country code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);
      await user.click(field());
      await user.paste("+1 201 555 0123");
      await user.click(countryButton());

      await user.click(screen.getByRole("option", { name: /United Kingdom/ }));

      expect(onChange).toHaveBeenLastCalledWith("+442015550123");
    });
  });

  describe("server render", () => {
    it("hydrates without a mismatch", async () => {
      const element = () => <Harness initialValue="+12015550123" />;
      const container = serverRender(element());

      const { consoleError, onRecoverableError } = await hydrate(
        container,
        element()
      );

      expect(consoleError).not.toHaveBeenCalled();
      expect(onRecoverableError).not.toHaveBeenCalled();
    });
  });
});
