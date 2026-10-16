import useFloatingPosition, { FloatingSide } from "../useFloatingPosition.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

const rect = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const element = (r: DOMRect) => {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => r;
  return el;
};

const setup = (
  side: FloatingSide,
  anchor: DOMRect,
  floating: DOMRect,
  options: { offset?: number; clampViewport?: boolean } = {}
) => {
  const floatingRef = { current: element(floating) };
  const hook = renderHook(
    ({ isOpen }) =>
      useFloatingPosition({ isOpen, side, floatingRef, ...options }),
    { initialProps: { isOpen: false } }
  );
  hook.result.current.anchorRef.current = element(anchor) as HTMLDivElement;
  hook.rerender({ isOpen: true });
  return hook;
};

const { innerWidth, innerHeight } = window;
beforeEach(() => {
  window.innerWidth = 1000;
  window.innerHeight = 800;
});
afterEach(() => {
  window.innerWidth = innerWidth;
  window.innerHeight = innerHeight;
});

describe("useFloatingPosition", () => {
  it("is null while closed", () => {
    const { result } = renderHook(() => useFloatingPosition({ isOpen: false }));
    expect(result.current.position).toBeNull();
  });

  it("sits below the anchor at its width by default", () => {
    const { result } = setup("below", rect(100, 50, 200, 30), rect(0, 0, 0, 0));
    expect(result.current.position).toEqual({ top: 80, left: 100, width: 200 });
  });

  it.each([
    ["top", { top: 50 - 40 - 4, left: 100 + (200 - 80) / 2 }],
    ["bottom", { top: 80 + 4, left: 100 + (200 - 80) / 2 }],
    ["left", { top: 50 + (30 - 40) / 2, left: 100 - 80 - 4 }],
    ["right", { top: 50 + (30 - 40) / 2, left: 300 + 4 }],
  ] as const)("centres on the %s side with the offset", (side, expected) => {
    const { result } = setup(side, rect(100, 50, 200, 30), rect(0, 0, 80, 40), {
      offset: 4,
    });
    expect(result.current.position).toEqual({ ...expected, width: 200 });
  });

  it("clamps inside the viewport", () => {
    const { result } = setup("top", rect(0, 0, 20, 20), rect(0, 0, 80, 40), {
      clampViewport: true,
    });
    expect(result.current.position).toMatchObject({ top: 8, left: 8 });
  });

  it("recomputes on resize and clears on close", () => {
    const anchor = rect(100, 50, 200, 30);
    const { result, rerender } = setup("below", anchor, rect(0, 0, 0, 0));

    result.current.anchorRef.current!.getBoundingClientRect = () =>
      rect(120, 60, 200, 30);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.position).toEqual({ top: 90, left: 120, width: 200 });

    rerender({ isOpen: false });
    expect(result.current.position).toBeNull();
  });

  it("clamps inside the right and bottom edges too", () => {
    const { result } = setup(
      "bottom",
      rect(990, 790, 20, 20),
      rect(0, 0, 80, 40),
      { clampViewport: true }
    );
    expect(result.current.position).toMatchObject({
      left: 1000 - 80 - 8,
      top: 800 - 40 - 8,
    });
  });
});
