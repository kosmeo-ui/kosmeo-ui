import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import CheckboxGroup from "../index.js";
import { expect, it, vi } from "vitest";

const options = [
  { value: "r", label: "Read" },
  { value: "w", label: "Write" },
];

it("checks the selected values", () => {
  render(
    <CheckboxGroup
      label="Access"
      name="access"
      options={options}
      values={["w"]}
      onChange={() => {}}
    />
  );
  expect(screen.getByText("Access")).toBeInTheDocument();
  expect(screen.getByLabelText("Read")).not.toBeChecked();
  expect(screen.getByLabelText("Write")).toBeChecked();
});

it("adds and removes values", async () => {
  const onChange = vi.fn();
  render(
    <CheckboxGroup
      name="access"
      options={options}
      values={["w"]}
      onChange={onChange}
    />
  );

  await userEvent.click(screen.getByLabelText("Read"));
  expect(onChange).toHaveBeenLastCalledWith(["w", "r"]);

  await userEvent.click(screen.getByLabelText("Write"));
  expect(onChange).toHaveBeenLastCalledWith([]);
});

it("disables every option", () => {
  render(
    <CheckboxGroup
      name="access"
      options={options}
      values={[]}
      onChange={() => {}}
      disabled
    />
  );
  for (const box of screen.getAllByRole("checkbox")) expect(box).toBeDisabled();
});
