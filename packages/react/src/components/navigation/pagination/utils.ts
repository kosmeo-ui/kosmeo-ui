export type PageRangeItem = number | "start-gap" | "end-gap";

/**
 * The page buttons to show: always the first and last page, the current page
 * with `siblings` neighbours either side, and a gap marker wherever pages are
 * skipped. The list is the same length on every page, so the control doesn't
 * jump around as you move through it.
 */
export const pageRange = (
  page: number,
  pageCount: number,
  siblings = 1
): PageRangeItem[] => {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

  // first + last + current + siblings + two gaps
  const slots = siblings * 2 + 5;
  if (pageCount <= slots) return range(1, pageCount);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const gapBefore = left > 2;
  const gapAfter = right < pageCount - 1;
  // Pages shown at the start or end when only one gap is needed.
  const edge = siblings * 2 + 3;

  if (!gapBefore) return [...range(1, edge), "end-gap", pageCount];
  if (!gapAfter)
    return [1, "start-gap", ...range(pageCount - edge + 1, pageCount)];
  return [1, "start-gap", ...range(left, right), "end-gap", pageCount];
};
