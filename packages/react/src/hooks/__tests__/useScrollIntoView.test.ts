import useScrollIntoView from "../useScrollIntoView.js";
import { renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

const makeItems = () =>
  [0, 1, 2].map(() => {
    const el = document.createElement("li");
    el.scrollIntoView = vi.fn();
    return el;
  });

it("scrolls the element at the index into view", () => {
  const items = makeItems();

  renderHook(() => useScrollIntoView({ current: items }, 0));

  expect(items[0].scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
});

it("scrolls the new element into view when the index changes", () => {
  const items = makeItems();
  const refs = { current: items };
  const { rerender } = renderHook(
    ({ index }) => useScrollIntoView(refs, index),
    { initialProps: { index: 0 } }
  );

  rerender({ index: 2 });

  expect(items[2].scrollIntoView).toHaveBeenCalledTimes(1);
});

it.each([
  ["for index -1", -1, true],
  ["while disabled", 1, false],
])("does nothing %s", (_case, index, enabled) => {
  const items = makeItems();

  renderHook(() => useScrollIntoView({ current: items }, index, enabled));

  for (const item of items) expect(item.scrollIntoView).not.toHaveBeenCalled();
});
