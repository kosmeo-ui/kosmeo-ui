import { render, screen, within } from "@testing-library/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import IconButton from "../index.js";

it("renders the icon inside the button, hidden from assistive tech", () => {
  render(<IconButton icon={faTrash} aria-label="Delete" />);

  const button = screen.getByRole("button", { name: "Delete" });
  expect(within(button).getByRole("img", { hidden: true })).toHaveAttribute(
    "aria-hidden",
    "true"
  );
});

it("calls onClick", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<IconButton icon={faTrash} aria-label="Delete" onClick={onClick} />);

  await user.click(screen.getByRole("button", { name: "Delete" }));

  expect(onClick).toHaveBeenCalledTimes(1);
});

it("names the button from children next to the icon", () => {
  render(<IconButton icon={faTrash}>Delete</IconButton>);

  expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
});
