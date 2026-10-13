import { ReactNode, SetStateAction, useCallback } from "react";
import { InfiniteScrollMenuGeneratedFilter } from "../types";
import SelectFilter from "./selectFilter";
import SearchFilter from "./searchFilter";
import RangeFilter from "./rangeFilter";
import ListFilter from "./listFilter";
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
    <div className="menu-filters-container">
      <div className="menu-filters">{props.pendingFilters.map(getFilter)}</div>
      {props.children && (
        <div className="menu-filters-buttons">{props.children}</div>
      )}
    </div>
  );
};

export default Filters;
