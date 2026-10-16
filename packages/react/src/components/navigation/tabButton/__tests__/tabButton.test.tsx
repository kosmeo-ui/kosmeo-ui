import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import TabButton from "../index.js";

it("maps props to classes", () => {
  render(
    <TabButton active size="sm" variant="secondary">
      Tab
    </TabButton>
  );
  expect(screen.getByRole("button")).toHaveClass(
    "k-tab-button",
    "k-tab-button-sm",
    "k-tab-button-secondary",
    "k-tab-button-active"
  );
});

it("calls onClick unless disabled", async () => {
  const onClick = vi.fn();
  const { rerender } = render(<TabButton onClick={onClick}>Tab</TabButton>);
  await userEvent.click(screen.getByRole("button"));
  expect(onClick).toHaveBeenCalledTimes(1);

  rerender(
    <TabButton onClick={onClick} disabled>
      Tab
    </TabButton>
  );
  await userEvent.click(screen.getByRole("button"));
  expect(onClick).toHaveBeenCalledTimes(1);
});
