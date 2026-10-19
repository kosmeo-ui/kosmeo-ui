import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useDebouncedValue from "../useDebouncedValue.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const setup = () =>
  renderHook(({ value }) => useDebouncedValue(value, 300), {
    initialProps: { value: "a" },
  });

it("returns the initial value immediately", () => {
  const { result } = renderHook(() => useDebouncedValue("a", 300));

  expect(result.current).toBe("a");
});

it("restarts the delay when the value changes again", () => {
  const { result, rerender } = setup();
  rerender({ value: "b" });
  act(() => vi.advanceTimersByTime(200));
  rerender({ value: "c" });

  act(() => vi.advanceTimersByTime(200));

  expect(result.current).toBe("a");
});

it("updates once the latest value has settled for the delay", () => {
  const { result, rerender } = setup();
  rerender({ value: "b" });
  act(() => vi.advanceTimersByTime(200));
  rerender({ value: "c" });
  act(() => vi.advanceTimersByTime(200));

  act(() => vi.advanceTimersByTime(100));

  expect(result.current).toBe("c");
});
