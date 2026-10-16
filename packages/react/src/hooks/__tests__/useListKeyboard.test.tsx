import { fireEvent, render, screen } from "@testing-library/react";
import useListKeyboard from "../useListKeyboard.js";
import { expect, it, vi } from "vitest";
import { useState } from "react";

const Harness = ({
  isOpen = true,
  length = 3,
  selectOnTab,
  onSelect,
  onClose = () => {},
}: {
  isOpen?: boolean;
  length?: number;
  selectOnTab?: boolean;
  onSelect: (index: number) => void;
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

const highlighted = () =>
  Number(screen.getByLabelText("list").dataset.highlighted);
const press = (key: string) =>
  fireEvent.keyDown(screen.getByLabelText("list"), { key });

it("moves the highlight with the arrow keys, clamped to the list", () => {
  render(<Harness onSelect={vi.fn()} />);

  press("ArrowDown");
  expect(highlighted()).toBe(0);
  press("ArrowDown");
  press("ArrowDown");
  press("ArrowDown");
  expect(highlighted()).toBe(2);
  press("ArrowUp");
  press("ArrowUp");
  press("ArrowUp");
  expect(highlighted()).toBe(0);
});

it("selects the highlighted item on Enter, and nothing when none is", () => {
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} />);

  press("Enter");
  expect(onSelect).not.toHaveBeenCalled();

  press("ArrowDown");
  press("ArrowDown");
  press("Enter");
  expect(onSelect).toHaveBeenCalledWith(1);
});

it("closes and clears the highlight on Escape", () => {
  const onClose = vi.fn();
  render(<Harness onSelect={vi.fn()} onClose={onClose} />);

  press("ArrowDown");
  press("Escape");
  expect(onClose).toHaveBeenCalled();
  expect(highlighted()).toBe(-1);
});

it("selects the first item on Tab when selectOnTab is set", () => {
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} selectOnTab />);
  press("Tab");
  expect(onSelect).toHaveBeenCalledWith(0);
});

it("ignores Tab without selectOnTab", () => {
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} />);
  press("Tab");
  expect(onSelect).not.toHaveBeenCalled();
});

it("ignores keys while closed", () => {
  const onSelect = vi.fn();
  render(<Harness onSelect={onSelect} isOpen={false} selectOnTab />);
  press("ArrowDown");
  press("Tab");
  expect(highlighted()).toBe(-1);
  expect(onSelect).not.toHaveBeenCalled();
});
