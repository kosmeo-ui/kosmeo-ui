"use client";

import { ReactNode, SetStateAction, useCallback, useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InfiniteScrollMenuGeneratedFilter } from "../types.js";
import { filterParams } from "../utils/generateQueryString.js";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import SelectFilter from "./selectFilter.js";
import SearchFilter from "./searchFilter.js";
import RangeFilter from "./rangeFilter.js";
import ListFilter from "./listFilter.js";
import "./styles.css";

interface InfiniteScrollMenuFiltersProps {
  pendingFilters: InfiniteScrollMenuGeneratedFilter[];
  handleNewPendingFilters: (
    filters: SetStateAction<InfiniteScrollMenuGeneratedFilter[]>
  ) => void;
  /** Applies the pending filters; Enter in a filter's text box calls it. Omit when there's nothing to apply. */
  onApply?: () => void;
  /** Range filters keep edits as a draft until their menu's Apply button. */
  rangeApplyInMenu?: boolean;
  children?: ReactNode;
}

// Enter in a search, number or date box applies, as in a form; checkboxes and
// buttons keep their own Enter behaviour.
const isTextEntry = (target: EventTarget) =>
  target instanceof HTMLInputElement &&
  !["checkbox", "radio", "button", "submit"].includes(target.type);

const Filters = (props: InfiniteScrollMenuFiltersProps) => {
  const [open, setOpen] = useState(false);
  const filtersId = useId();
  const setCount = props.pendingFilters.filter(
    (f) => Object.keys(filterParams([f])).length > 0
  ).length;

  const handleFilterChange = useCallback(
    (filter: InfiniteScrollMenuGeneratedFilter) => {
      props.handleNewPendingFilters((prevFilters) =>
        prevFilters.map((f) => (f.filterId === filter.filterId ? filter : f))
      );
    },
    [props.handleNewPendingFilters]
  );

  const getFilter = (filter: InfiniteScrollMenuGeneratedFilter) => {
    if (filter.type === "SELECT") {
      return (
        <SelectFilter
          key={filter.filterId}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      );
    } else if (filter.type === "RANGE") {
      return (
        <RangeFilter
          key={filter.filterId}
          filter={filter}
          onFilterChange={handleFilterChange}
          applyInMenu={props.rangeApplyInMenu}
        />
      );
    } else if (filter.type === "SEARCH") {
      return (
        <SearchFilter
          key={filter.filterId}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      );
    } else {
      return (
        <ListFilter
          key={filter.filterId}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" || !props.onApply || !isTextEntry(e.target)) return;
    e.preventDefault();
    props.onApply();
  };

  return (
    <div
      className={`k-menu-filters-container${open ? " k-menu-filters-open" : ""}`}
      onKeyDown={handleKeyDown}
    >
      {/* Shown only on narrow screens, where the filters start hidden. */}
      <button
        type="button"
        className="k-menu-filters-toggle"
        aria-expanded={open}
        aria-controls={filtersId}
        onClick={() => setOpen(!open)}
      >
        <FontAwesomeIcon icon={faFilter} />
        {setCount > 0 ? `Filters (${setCount})` : "Filters"}
      </button>
      <div id={filtersId} className="k-menu-filters">
        {props.pendingFilters.map(getFilter)}
      </div>
      {props.children && (
        <div className="k-menu-filters-buttons">{props.children}</div>
      )}
    </div>
  );
};

export default Filters;
