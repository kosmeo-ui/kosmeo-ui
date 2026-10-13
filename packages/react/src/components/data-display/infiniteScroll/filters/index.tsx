"use client";

import { InfiniteScrollMenuGeneratedFilter } from "../types.js";
import { ReactNode, SetStateAction, useCallback } from "react";
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
  children?: ReactNode;
}

const Filters = (props: InfiniteScrollMenuFiltersProps) => {
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

  return (
    <div className="k-menu-filters-container">
      <div className="k-menu-filters">
        {props.pendingFilters.map(getFilter)}
      </div>
      {props.children && (
        <div className="k-menu-filters-buttons">{props.children}</div>
      )}
    </div>
  );
};

export default Filters;
