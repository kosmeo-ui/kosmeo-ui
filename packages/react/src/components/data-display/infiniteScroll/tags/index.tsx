"use client";

import { InfiniteScrollMenuGeneratedFilter } from "../types.js";
import { hasRangeValue } from "../utils/hasPendingChanges.js";
import SelectFilterTag from "./selectFilterTag.js";
import RangeFilterTag from "./rangeFilterTag.js";
import ListFilterTag from "./listFilterTag.js";
import "./styles.css";

interface InfiniteScrollMenuTagsProps {
  filters: InfiniteScrollMenuGeneratedFilter[];
  handleNewFilters: (filters: InfiniteScrollMenuGeneratedFilter[]) => void;
}

const Tags = (props: InfiniteScrollMenuTagsProps) => {
  // SEARCH filters get no tag: their search box already shows the value.
  const filterTags = props.filters.reduce((tags, f) => {
    if (f.type === "SELECT") {
      const selectedFilters = f.options?.filter((o) => o.selected);
      if (!selectedFilters) return tags;
      for (const selectedFilter of selectedFilters) {
        tags.push(
          <SelectFilterTag
            key={`${f.filterId}-${selectedFilter.id}`}
            filter={f}
            filterOption={selectedFilter}
            filters={props.filters}
            handleNewFilters={props.handleNewFilters}
          />
        );
      }
    } else if (f.type === "RANGE") {
      if (hasRangeValue(f.startValue)) {
        tags.push(
          <RangeFilterTag
            key={`${f.filterId}-start`}
            filter={f}
            filters={props.filters}
            filterValue="startValue"
            handleNewFilters={props.handleNewFilters}
          />
        );
      }
      if (hasRangeValue(f.endValue)) {
        tags.push(
          <RangeFilterTag
            key={`${f.filterId}-end`}
            filter={f}
            filters={props.filters}
            filterValue="endValue"
            handleNewFilters={props.handleNewFilters}
          />
        );
      }
    } else if (f.type === "LIST") {
      if (!f.list) return tags;
      tags.push(
        <ListFilterTag
          key={f.filterId}
          filter={f}
          filters={props.filters}
          handleNewFilters={props.handleNewFilters}
        />
      );
    }
    return tags;
  }, [] as React.ReactNode[]);

  if (!filterTags.length) return null;
  return <div className="k-tags-container">{filterTags}</div>;
};

export default Tags;
