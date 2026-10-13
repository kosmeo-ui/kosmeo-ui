import { RefObject, useEffect } from "react";

/**
 * Calls `onOutside` when a mousedown event lands outside every passed-in ref.
 * Pass the container ref AND any portal/floating ref so clicks inside the
 * floating layer aren't treated as outside clicks.
 */
const useOutsideClick = (
  refs: RefObject<HTMLElement | null>[],
  onOutside: () => void,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside = refs.some((r) => r.current && r.current.contains(target));
      if (!inside) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [refs, onOutside, enabled]);
};

export default useOutsideClick;
