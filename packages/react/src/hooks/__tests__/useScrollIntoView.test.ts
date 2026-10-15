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
  const refs = { current: items };
  const { rerender } = renderHook(
    ({ index }) => useScrollIntoView(refs, index),
    { initialProps: { index: 0 } }
  );
  expect(items[0].scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

  rerender({ index: 2 });
  expect(items[2].scrollIntoView).toHaveBeenCalledTimes(1);
});

it("does nothing for -1 or while disabled", () => {
  const items = makeItems();
  const refs = { current: items };
  renderHook(() => useScrollIntoView(refs, -1));
  renderHook(() => useScrollIntoView(refs, 1, false));
  for (const item of items) expect(item.scrollIntoView).not.toHaveBeenCalled();
});
