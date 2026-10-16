import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Select from "../index.js";

const options = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
];

describe("Select", () => {
  it("is named by its label and shows the value", () => {
    render(<Select label="Fruit" options={options} value="a" />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveValue("a");
  });

  it("renders an option for each entry", () => {
    render(<Select label="Fruit" options={options} value="a" />);

    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("calls onChange with the chosen value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select label="Fruit" options={options} value="a" onChange={onChange} />
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Fruit" }),
      "b"
    );

    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("reports undefined when the placeholder is chosen", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        label="Fruit"
        options={options}
        value="a"
        placeholder="Pick one"
        onChange={onChange}
      />
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Fruit" }),
      ""
    );

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("disables the placeholder when required", () => {
    render(
      <Select options={options} placeholder="Pick one" required value="" />
    );

    expect(screen.getByRole("option", { name: "Pick one" })).toBeDisabled();
  });

  it("syncs the parent to the first option when the value matches none", () => {
    const onChange = vi.fn();

    render(<Select options={options} value="zzz" onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("leaves an empty value alone when there's a placeholder", () => {
    const onChange = vi.fn();

    render(<Select options={options} placeholder="Pick" onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });
});
