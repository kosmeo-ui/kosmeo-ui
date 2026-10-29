"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Below this width `AppTopBar` always folds its links into a menu, and `SectionLayout`'s sidebar is a drawer. */
export const NARROW_SCREEN = "(max-width: 768px)";

/**
 * Whether `query` matches now, updated as the viewport changes. False on the
 * server and while hydrating, then the real value.
 */
const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      // Optional, as is the read below: jsdom, where apps run their tests, has no matchMedia.
      const list = window.matchMedia?.(query);
      list?.addEventListener("change", onChange);
      return () => list?.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(query).matches ?? false,
    () => false
  );
};

export default useMediaQuery;
