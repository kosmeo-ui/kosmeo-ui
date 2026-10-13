"use client";

import { faCheckSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../../../buttons/iconButton/index.js";
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
    <div className="k-tag-container">
      <p className="k-tag-title">{props.filter.title}</p>
      <div className="k-tag-actions">
        <FontAwesomeIcon icon={faCheckSquare} />
        <p className="k-tag-value">{props.filterOption.name}</p>
        <IconButton onClick={handleRemove} size="sm" icon={faXmark} />
      </div>
    </div>
  );
};

export default SelectFilterTag;
