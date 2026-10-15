import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useDebouncedValue from "../useDebouncedValue.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("returns the initial value immediately", () => {
  const { result } = renderHook(() => useDebouncedValue("a", 300));
  expect(result.current).toBe("a");
});

it("updates only after the value has settled for the delay", () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebouncedValue(value, 300),
    { initialProps: { value: "a" } }
  );

  rerender({ value: "b" });
  act(() => vi.advanceTimersByTime(200));
  rerender({ value: "c" });
  act(() => vi.advanceTimersByTime(200));
  expect(result.current).toBe("a");

  act(() => vi.advanceTimersByTime(100));
  expect(result.current).toBe("c");
});
