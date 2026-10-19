import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import RadioGroup from "../index.js";

const options = [
  { value: "s", label: "Small" },
  { value: "l", label: "Large" },
];

it("checks the selected value", () => {
  render(
    <RadioGroup name="size" options={options} value="l" onChange={() => {}} />
  );

  expect(screen.getByRole("radio", { name: "Large" })).toBeChecked();
});

it("leaves the other values unchecked", () => {
  render(
    <RadioGroup name="size" options={options} value="l" onChange={() => {}} />
  );

  expect(screen.getByRole("radio", { name: "Small" })).not.toBeChecked();
});

it.each(["Small", "Large"])("gives %s the group's name", (label) => {
  render(
    <RadioGroup name="size" options={options} value="l" onChange={() => {}} />
  );

  expect(screen.getByRole("radio", { name: label })).toHaveAttribute(
    "name",
    "size"
  );
});

it("reports the chosen value", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <RadioGroup
      name="size"
      options={options}
      value={null}
      onChange={onChange}
    />
  );

  await user.click(screen.getByRole("radio", { name: "Small" }));

  expect(onChange).toHaveBeenCalledWith("s");
});

it.each(["Small", "Large"])(
  "disables %s when the group is disabled",
  (label) => {
    render(
      <RadioGroup
        name="size"
        options={options}
        value={null}
        onChange={() => {}}
        disabled
      />
    );

    expect(screen.getByRole("radio", { name: label })).toBeDisabled();
  }
);
