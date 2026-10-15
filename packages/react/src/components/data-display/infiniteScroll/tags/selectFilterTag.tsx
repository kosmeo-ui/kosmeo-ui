"use client";

import Badge from "../../../feedback/badge/index.js";
import { useCallback } from "react";
import "../styles.css";
import {
  GeneratedSelectFilter,
  InfiniteScrollMenuFilterOption,
  InfiniteScrollMenuGeneratedFilter,
} from "../types.js";

interface InfiniteScrollSelectFilterTagProps {
  filter: GeneratedSelectFilter;
  filterOption: InfiniteScrollMenuFilterOption;
  filters: InfiniteScrollMenuGeneratedFilter[];
  handleNewFilters: (filters: InfiniteScrollMenuGeneratedFilter[]) => void;
}

const SelectFilterTag = (props: InfiniteScrollSelectFilterTagProps) => {
  const handleRemove = useCallback(() => {
    const newFilters = props.filters.map((f) => {
      if (props.filter.filterId !== f.filterId || f.type !== "SELECT") return f;
      const newOptions = f.options?.map((o) => {
        if (o.id === props.filterOption.id) return { ...o, selected: false };
        else return o;
      });
      return { ...f, options: newOptions };
    });
    props.handleNewFilters(newFilters);
  }, [props]);

  return (
    <Badge onRemove={handleRemove}>
      {props.filter.title}: {props.filterOption.name}
    </Badge>
  );
};

export default SelectFilterTag;
