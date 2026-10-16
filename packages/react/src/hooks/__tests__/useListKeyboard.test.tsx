import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import useListKeyboard from "../useListKeyboard.js";
import { expect, it, vi } from "vitest";
import { useState } from "react";

const Harness = ({
  isOpen = true,
  length = 3,
  selectOnTab,
  onSelect = () => {},
  onClose = () => {},
}: {
  isOpen?: boolean;
  length?: number;
  selectOnTab?: boolean;
  onSelect?: (index: number) => void;
  onClose?: () => void;
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const onKeyDown = useListKeyboard({
    isOpen,
    length,
    highlightedIndex,
    setHighlightedIndex,
    onSelect,
    onClose,
    selectOnTab,
  });
  return (
    <input
      aria-label="list"
      data-highlighted={highlightedIndex}
      onKeyDown={onKeyDown}
    />
  );
};

const input = () => screen.getByRole("textbox", { name: "list" });

it.each([
  ["highlights the first item on ArrowDown", "{ArrowDown}", "0"],
  [
    "stops at the last item",
    "{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}",
    "2",
  ],
  [
    "stops at the first item",
    "{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowUp}{ArrowUp}{ArrowUp}",
    "0",
  ],
])("%s", async (_name, keys, expected) => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(input());

  await user.keyboard(keys);

  expect(input()).toHaveAttribute("data-highlighted", expected);
});

it("selects nothing on Enter when no item is highlighted", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} />);
  await user.click(input());

  await user.keyboard("{Enter}");

  expect(onSelect).not.toHaveBeenCalled();
});

it("selects the highlighted item on Enter", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} />);
  await user.click(input());
  await user.keyboard("{ArrowDown}{ArrowDown}");

  await user.keyboard("{Enter}");

  expect(onSelect).toHaveBeenCalledWith(1);
});

it("closes and clears the highlight on Escape", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<Harness onClose={onClose} />);
  await user.click(input());
  await user.keyboard("{ArrowDown}");

  await user.keyboard("{Escape}");

  expect(onClose).toHaveBeenCalled();
  expect(input()).toHaveAttribute("data-highlighted", "-1");
});

it("selects the first item on Tab when selectOnTab is set", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} selectOnTab />);
  await user.click(input());

  await user.keyboard("{Tab}");

  expect(onSelect).toHaveBeenCalledWith(0);
});

it("ignores Tab without selectOnTab", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} />);
  await user.click(input());

  await user.keyboard("{Tab}");

  expect(onSelect).not.toHaveBeenCalled();
});

it("ignores keys while closed", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} isOpen={false} selectOnTab />);
  await user.click(input());

  await user.keyboard("{ArrowDown}{Tab}");

  expect(input()).toHaveAttribute("data-highlighted", "-1");
  expect(onSelect).not.toHaveBeenCalled();
});
