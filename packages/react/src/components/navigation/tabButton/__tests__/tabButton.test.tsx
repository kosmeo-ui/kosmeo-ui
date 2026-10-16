import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import TabButton from "../index.js";

it.each([
  [
    "active, size and variant",
    { active: true, size: "sm", variant: "secondary" } as const,
    "k-tab-button k-tab-button-sm k-tab-button-secondary k-tab-button-active",
  ],
  ["the defaults", {}, "k-tab-button k-tab-button-md k-tab-button-primary"],
  [
    "disabled",
    { disabled: true },
    "k-tab-button k-tab-button-md k-tab-button-primary k-tab-button-disabled",
  ],
])("maps %s to classes", (_, props, classes) => {
  render(<TabButton {...props}>Tab</TabButton>);

  expect(screen.getByRole("button", { name: "Tab" })).toHaveClass(classes, {
    exact: true,
  });
});

it("calls onClick", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<TabButton onClick={onClick}>Tab</TabButton>);

  await user.click(screen.getByRole("button", { name: "Tab" }));

  expect(onClick).toHaveBeenCalledTimes(1);
});

it("is disabled when the disabled prop is set", () => {
  render(<TabButton disabled>Tab</TabButton>);

  expect(screen.getByRole("button", { name: "Tab" })).toBeDisabled();
});

it("doesn't call onClick while disabled", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <TabButton onClick={onClick} disabled>
      Tab
    </TabButton>
  );

  await user.click(screen.getByRole("button", { name: "Tab" }));

  expect(onClick).not.toHaveBeenCalled();
});
