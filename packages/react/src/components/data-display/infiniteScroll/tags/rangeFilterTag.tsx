"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../../../buttons/iconButton/index.js";
import { useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import "./styles.css";
import {
  faCalendarDays,
  faFont,
  faHashtag,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  GeneratedRangeFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../types.js";

interface InfiniteScrollRangeFilterTagProps {
  filter: GeneratedRangeFilter;
  filterValue: "startValue" | "endValue";
  filters: InfiniteScrollMenuGeneratedFilter[];
  handleNewFilters: (filters: InfiniteScrollMenuGeneratedFilter[]) => void;
}

const RangeFilterTag = (props: InfiniteScrollRangeFilterTagProps) => {
  const { filter, filterValue } = props;

  const isDate = useMemo(() => {
    return filter.rangeType === "DATE" || filter.rangeType === "DATETIME";
  }, [filter.rangeType]);

  const tagTitle = useMemo(() => {
    const startSuffix = isDate ? "After" : "Start";
    const endSuffix = isDate ? "Before" : "End";
    const suffix = filterValue === "startValue" ? startSuffix : endSuffix;
    return `${filter.title} ${suffix}`;
  }, [filter.rangeType, filterValue]);

  const tagValue = useMemo(() => {
    const value = filter[filterValue];
    if (!value) return "";
    if (filter.rangeType === "DATE") {
      return DateTime.fromISO(String(value)).toFormat("D");
    } else if (filter.rangeType === "DATETIME") {
      return DateTime.fromISO(String(value)).toFormat("D ttt");
    } else if (filter.rangeType === "NUMBER") return value;
    else if (filter.rangeType === "STRING") return value;
  }, [filter, filterValue, filter.rangeType]);

  const iconToUse = useMemo(() => {
    if (isDate) return faCalendarDays;
    else if (filter.rangeType === "NUMBER") return faHashtag;
    else if (filter.rangeType === "STRING") return faFont;
  }, [filter.rangeType]);

  const handleRemove = useCallback(() => {
    const newFilters = props.filters.map((f) => {
      if (f.filterId !== props.filter.filterId) return f;
      return { ...f, [filterValue]: undefined };
    });
    props.handleNewFilters(newFilters);
  }, [props.filters, filterValue]);

  return (
    <div className="k-tag-container">
      <p className="k-tag-title">{tagTitle}</p>
      <div className="k-tag-actions">
        {iconToUse && <FontAwesomeIcon icon={iconToUse} />}
        <p className="k-tag-value">{tagValue}</p>
        <IconButton icon={faXmark} onClick={handleRemove} size="sm" />
      </div>
    </div>
  );
};

export default RangeFilterTag;
