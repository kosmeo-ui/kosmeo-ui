import LanguageSelect, { SUPPORTED_LANGUAGES } from "../index.js";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";

const Harness = ({
  initialValue = null,
  includeNone,
  onChange = () => {},
}: {
  initialValue?: string | null;
  includeNone?: boolean;
  onChange?: (value: string | null) => void;
}) => {
  const [value, setValue] = useState<string | null>(initialValue);
  return (
    <LanguageSelect
      value={value}
      includeNone={includeNone}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
};

const select = () =>
  screen.getByRole("combobox", { name: "Preferred language" });

describe("LanguageSelect", () => {
  it('is named "Preferred language" by default', () => {
    render(<LanguageSelect />);

    expect(select()).toBeVisible();
  });

  it("is named by a custom label", () => {
    render(<LanguageSelect label="Language" />);

    expect(screen.getByRole("combobox", { name: "Language" })).toBeVisible();
  });

  it("offers None first, then every supported language", () => {
    render(<LanguageSelect />);

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["— None —", ...SUPPORTED_LANGUAGES.map((l) => l.label)]);
  });

  it("offers only the languages without includeNone", () => {
    render(<LanguageSelect value="en-US" includeNone={false} />);

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(SUPPORTED_LANGUAGES.map((l) => l.label));
  });

  it.each([null, undefined])("selects None for a %s value", (value) => {
    render(<LanguageSelect value={value} />);

    expect(select()).toHaveDisplayValue("— None —");
  });

  it("shows the selected language", () => {
    render(<LanguageSelect value="fr-CA" />);

    expect(select()).toHaveDisplayValue("French (Canada)");
  });

  it("reports the chosen language", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.selectOptions(select(), "German (Germany)");

    expect(onChange).toHaveBeenCalledWith("de-DE");
  });

  it("shows the chosen language", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.selectOptions(select(), "German (Germany)");

    expect(select()).toHaveDisplayValue("German (Germany)");
  });

  it("reports null when None is chosen", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness initialValue="de-DE" onChange={onChange} />);

    await user.selectOptions(select(), "— None —");

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("shows None for a language with no entry", () => {
    render(<Harness initialValue="en" />);

    expect(select()).toHaveDisplayValue("— None —");
  });

  it.todo(
    'decide whether a stored language with no entry ("en") is cleared on mount — currently onChange(null) fires with no user action'
  );

  it("reports the first language when there is no None to show", () => {
    const onChange = vi.fn();

    render(<Harness includeNone={false} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith("en-US");
  });

  it("passes id to the select", () => {
    render(<LanguageSelect id="lang" />);

    expect(select()).toHaveAttribute("id", "lang");
  });

  it("disables the select when disabled", () => {
    render(<LanguageSelect disabled />);

    expect(select()).toBeDisabled();
  });

  it("marks the select required when required", () => {
    render(<LanguageSelect required />);

    expect(select()).toBeRequired();
  });
});
