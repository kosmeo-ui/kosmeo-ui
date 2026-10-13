"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Dropdown from "../../../inputs/dropdown/index.js";
import Input from "../../../inputs/input/index.js";
import { DateTime } from "luxon";
import "./styles.css";
import {
  faCalendarDays,
  faFont,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import {
  GeneratedRangeFilter,
  InfiniteScrollMenuGeneratedFilter,
  RangeValue,
} from "../types.js";

interface InfiniteScrollRangeFilterProps {
  filter: GeneratedRangeFilter;
  onFilterChange: (filter: InfiniteScrollMenuGeneratedFilter) => void;
}

const RangeFilter = (props: InfiniteScrollRangeFilterProps) => {
  const [startValue, setStartValue] = useState<RangeValue | undefined>(
    props.filter.startValue
  );
  const [endValue, setEndValue] = useState<RangeValue | undefined>(
    props.filter.endValue
  );

  useEffect(() => {
    if (props.filter.startValue === startValue) return;
    setStartValue(props.filter.startValue);
    return;
  }, [props.filter.startValue, startValue]);

  useEffect(() => {
    if (props.filter.endValue === endValue) return;
    setEndValue(props.filter.endValue);
    return;
  }, [props.filter.endValue, endValue]);

  const inputType = useMemo(() => {
    if (props.filter.rangeType === "NUMBER") {
      return "number";
    } else if (props.filter.rangeType === "DATE") {
      return "date";
    } else if (props.filter.rangeType === "DATETIME") {
      return "datetime-local";
    } else return "text";
  }, [props.filter.rangeType]);

  const iconToUse = useMemo(() => {
    if (
      props.filter.rangeType === "DATE" ||
      props.filter.rangeType === "DATETIME"
    ) {
      return faCalendarDays;
    } else if (props.filter.rangeType === "NUMBER") return faHashtag;
    else return faFont;
  }, [props.filter.rangeType]);

  const formattedStartValue = useMemo((): RangeValue => {
    if (!startValue) return "";
    if (props.filter.rangeType === "DATE") {
      return DateTime.fromISO(startValue as string).toFormat("yyyy-MM-dd");
    } else if (props.filter.rangeType === "DATETIME") {
      return DateTime.fromISO(startValue as string).toFormat(
        "yyyy-MM-dd'T'HH:mm"
      );
    } else return startValue;
  }, [props.filter.rangeType, startValue]);

  const formattedEndValue = useMemo((): RangeValue => {
    if (!endValue) return "";
    if (props.filter.rangeType === "DATE") {
      return DateTime.fromISO(endValue as string).toFormat("yyyy-MM-dd");
    } else if (props.filter.rangeType === "DATETIME") {
      return DateTime.fromISO(endValue as string).toFormat(
        "yyyy-MM-dd'T'HH:mm"
      );
    } else return endValue;
  }, [props.filter.rangeType, endValue]);

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: RangeValue;
      if (props.filter.rangeType === "NUMBER") {
        newValue = parseInt(e.target.value);
      } else if (props.filter.rangeType === "DATE") {
        const res = DateTime.fromISO(e.target.value).toUTC().toISO();
        if (!res) throw new Error("Invalid date");
        newValue = res;
      } else if (props.filter.rangeType === "DATETIME") {
        const res = DateTime.fromISO(e.target.value).toUTC().toISO();
        if (!res) throw new Error("Invalid date");
        newValue = res;
      } else newValue = e.target.value;
      setStartValue(newValue);
      props.onFilterChange({
        ...props.filter,
        startValue: newValue,
        endValue,
      });
    },
    [props, endValue]
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: RangeValue;
      if (props.filter.rangeType === "NUMBER") {
        newValue = parseInt(e.target.value);
      } else if (props.filter.rangeType === "DATE") {
        const res = DateTime.fromISO(e.target.value).toUTC().toISO();
        if (!res) throw new Error("Invalid date");
        newValue = res;
      } else if (props.filter.rangeType === "DATETIME") {
        const res = DateTime.fromISO(e.target.value).toUTC().toISO();
        if (!res) throw new Error("Invalid date");
        newValue = res;
      } else newValue = e.target.value;
      setEndValue(newValue);
      props.onFilterChange({
        ...props.filter,
        startValue,
        endValue: newValue,
      });
    },
    [props, startValue]
  );

  return (
    <Dropdown
      size="sm"
      variant="secondary"
      label={props.filter.title}
      icon={iconToUse}
      align="left"
    >
      <div className="k-filter-menu">
        <div className="k-range-filter-menu-column">
          <p className="k-range-filter-menu-label">Start</p>
          <Input
            size="sm"
            type={inputType}
            value={formattedStartValue}
            onChange={handleStartChange}
            max={formattedEndValue}
          />
        </div>
        <div className="k-range-filter-menu-column">
          <p className="k-range-filter-menu-label">End</p>
          <Input
            size="sm"
            type={inputType}
            value={formattedEndValue}
            onChange={handleEndChange}
            min={formattedStartValue}
          />
        </div>
      </div>
    </Dropdown>
  );
};

export default RangeFilter;
