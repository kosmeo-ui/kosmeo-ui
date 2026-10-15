"use client";

import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../../inputs/input/index.js";
import "./styles.css";
import {
  GeneratedSearchFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../types.js";

interface InfiniteScrollSearchFilterProps {
  filter: GeneratedSearchFilter;
  onFilterChange: (filter: InfiniteScrollMenuGeneratedFilter) => void;
}

// Typing updates the pending filter, like the other filters; Apply applies it.
const SearchFilter = (props: InfiniteScrollSearchFilterProps) => (
  <div className="k-search-filter">
    <Input
      size="sm"
      label={props.filter.title}
      placeholder="Search…"
      prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
      value={props.filter.value ?? ""}
      onChange={(e) =>
        props.onFilterChange({ ...props.filter, value: e.target.value })
      }
      onClear={() => props.onFilterChange({ ...props.filter, value: "" })}
    />
  </div>
);

export default SearchFilter;
