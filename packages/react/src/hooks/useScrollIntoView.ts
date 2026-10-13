import { RefObject, useEffect } from "react";

/**
 * Scrolls the element at `refs.current[index]` into view whenever `index`
 * changes while `enabled` is true. Used for keyboard navigation in list-style
 * dropdowns.
 */
const useScrollIntoView = (
  refs: RefObject<(HTMLElement | null)[]>,
  index: number,
  enabled = true,
  options: ScrollIntoViewOptions = { block: "nearest" }
) => {
  useEffect(() => {
    if (!enabled || index < 0) return;
    const el = refs.current?.[index];
    if (!el) return;
    el.scrollIntoView(options);
  }, [index, enabled]);
};

export default useScrollIntoView;
