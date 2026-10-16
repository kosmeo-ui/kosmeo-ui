import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import IconButton from "../index.js";

it("renders the icon inside a labelled button", async () => {
  const onClick = vi.fn();
  render(<IconButton icon={faTrash} aria-label="Delete" onClick={onClick} />);

  const button = screen.getByRole("button", { name: "Delete" });
  expect(button.querySelector("svg")).toBeInTheDocument();

  await userEvent.click(button);
  expect(onClick).toHaveBeenCalled();
});

it("renders children next to the icon", () => {
  render(<IconButton icon={faTrash}>Delete</IconButton>);
  expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
});
