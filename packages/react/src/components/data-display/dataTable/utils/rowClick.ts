import type { MouseEvent } from "react";

const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable="true"]';

/**
 * Runs a row's click handler unless the click came from a link, button or
 * other control inside the row, which handles the click itself.
 */
const handleRowClick = (
  e: MouseEvent<HTMLTableRowElement>,
  run: () => void
) => {
  const hit = (e.target as Element).closest(INTERACTIVE);
  // A match outside the row is an ancestor of the whole table, not a cell's.
  if (hit && e.currentTarget.contains(hit)) return;
  run();
};

export default handleRowClick;
