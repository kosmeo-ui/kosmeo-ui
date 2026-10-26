import { NARROW_SCREEN } from "../useMediaQuery.js";
import { act } from "@testing-library/react";
import { vi } from "vitest";

/**
 * Stubs `matchMedia` (jsdom has none) with a viewport that matches
 * `NARROW_SCREEN` while `narrow`. The caller undoes it with
 * `vi.unstubAllGlobals()`.
 */
export const stubScreen = (narrow: boolean) => {
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query === NARROW_SCREEN && narrow;
    },
    addEventListener: (_type: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) =>
      listeners.delete(listener),
  }));
  return {
    /** Crosses the breakpoint: no user-event API can resize the viewport. */
    resize: (toNarrow: boolean) =>
      act(() => {
        narrow = toNarrow;
        listeners.forEach((listener) => listener());
      }),
  };
};
