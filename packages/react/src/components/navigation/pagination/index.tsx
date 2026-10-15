"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "../../inputs/select/index.js";
import { PropsWithSize } from "../../types.js";
import { pageRange } from "./utils.js";
import { useId } from "react";
import "./styles.css";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export interface PaginationProps extends PropsWithSize {
  /** Current page, starting at 1. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total item count. With `pageSize`, shows a "51–75 of 240" summary. */
  total?: number;
  /** Items per page. Needed for the summary and the page-size picker. */
  pageSize?: number;
  /** Page sizes to offer. With `onPageSizeChange`, shows a "Rows per page" picker. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** Pages shown either side of the current page before a "…" gap. Defaults to 1. */
  siblingCount?: number;
  /** Accessible name for the navigation landmark. Defaults to "Pagination". */
  "aria-label"?: string;
}

const Pagination = ({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  siblingCount = 1,
  size = "md",
  "aria-label": ariaLabel = "Pagination",
}: PaginationProps) => {
  const pageSizeId = useId();
  const lastPage = Math.max(pageCount, 1);
  const current = Math.min(Math.max(page, 1), lastPage);

  const goTo = (target: number) => {
    if (target >= 1 && target <= lastPage && target !== current) {
      onPageChange(target);
    }
  };

  const summary =
    total !== undefined && pageSize !== undefined
      ? total === 0
        ? "No results"
        : `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, total)} of ${total.toLocaleString()}`
      : undefined;

  return (
    <nav className={`k-pagination k-pagination-${size}`} aria-label={ariaLabel}>
      {summary && (
        <p className="k-pagination-summary" aria-live="polite">
          {summary}
        </p>
      )}

      <ul className="k-pagination-pages">
        <li>
          <button
            type="button"
            className="k-pagination-button"
            onClick={() => goTo(current - 1)}
            disabled={current <= 1}
            aria-label="Previous page"
          >
            <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
          </button>
        </li>
        {pageRange(current, lastPage, siblingCount).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className={`k-pagination-button${item === current ? " k-pagination-button-current" : ""}`}
                onClick={() => goTo(item)}
                aria-label={`Page ${item}`}
                aria-current={item === current ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="k-pagination-gap" aria-hidden="true">
              …
            </li>
          )
        )}
        <li>
          <button
            type="button"
            className="k-pagination-button"
            onClick={() => goTo(current + 1)}
            disabled={current >= lastPage}
            aria-label="Next page"
          >
            <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
          </button>
        </li>
      </ul>

      {pageSizeOptions && onPageSizeChange && (
        <div className="k-pagination-page-size">
          <label htmlFor={pageSizeId}>Rows per page</label>
          {/* Select works in strings. */}
          <Select
            id={pageSizeId}
            size="sm"
            value={pageSize === undefined ? undefined : String(pageSize)}
            options={pageSizeOptions.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
            onChange={(n) => n !== undefined && onPageSizeChange(Number(n))}
          />
        </div>
      )}
    </nav>
  );
};

export default Pagination;
