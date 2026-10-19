import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import CheckboxGroup from "../index.js";

const options = [
  { value: "r", label: "Read" },
  { value: "w", label: "Write" },
];

it("is named by its label", () => {
  render(
    <CheckboxGroup
      label="Access"
      name="access"
      options={options}
      values={["w"]}
      onChange={() => {}}
    />
  );

  expect(screen.getByRole("group", { name: "Access" })).toBeVisible();
});

it("checks the selected values", () => {
  render(
    <CheckboxGroup
      name="access"
      options={options}
      values={["w"]}
      onChange={() => {}}
    />
  );

  expect(screen.getByRole("checkbox", { name: "Write" })).toBeChecked();
});

it("leaves the other values unchecked", () => {
  render(
    <CheckboxGroup
      name="access"
      options={options}
      values={["w"]}
      onChange={() => {}}
    />
  );

  expect(screen.getByRole("checkbox", { name: "Read" })).not.toBeChecked();
});

it.each([
  ["adds", "Read", ["w", "r"]],
  ["removes", "Write", []],
])("%s %s when clicked", async (_verb, label, expected) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <CheckboxGroup
      name="access"
      options={options}
      values={["w"]}
      onChange={onChange}
    />
  );

  await user.click(screen.getByRole("checkbox", { name: label }));

  expect(onChange).toHaveBeenCalledWith(expected);
});

it.each(["Read", "Write"])(
  "disables %s when the group is disabled",
  (label) => {
    render(
      <CheckboxGroup
        name="access"
        options={options}
        values={[]}
        onChange={() => {}}
        disabled
      />
    );

    expect(screen.getByRole("checkbox", { name: label })).toBeDisabled();
  }
);
