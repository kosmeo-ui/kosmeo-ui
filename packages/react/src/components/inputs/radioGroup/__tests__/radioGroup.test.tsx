import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import RadioGroup from "../index.js";

const options = [
  { value: "s", label: "Small" },
  { value: "l", label: "Large" },
];

it("checks the selected value and shares a name", () => {
  render(
    <RadioGroup name="size" options={options} value="l" onChange={() => {}} />
  );
  expect(screen.getByLabelText("Large")).toBeChecked();
  expect(screen.getByLabelText("Small")).not.toBeChecked();
  for (const radio of screen.getAllByRole("radio"))
    expect(radio).toHaveAttribute("name", "size");
});

it("reports the chosen value", async () => {
  const onChange = vi.fn();
  render(
    <RadioGroup
      name="size"
      options={options}
      value={null}
      onChange={onChange}
    />
  );
  await userEvent.click(screen.getByLabelText("Small"));
  expect(onChange).toHaveBeenCalledWith("s");
});

it("disables every option", () => {
  render(
    <RadioGroup
      name="size"
      options={options}
      value={null}
      onChange={() => {}}
      disabled
    />
  );
  for (const radio of screen.getAllByRole("radio"))
    expect(radio).toBeDisabled();
});
