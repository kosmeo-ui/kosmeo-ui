"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { hasRangeValue } from "../utils/hasPendingChanges.js";
import Dropdown from "../../../inputs/dropdown/index.js";
import Button from "../../../buttons/button/index.js";
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
  /**
   * Edits stay a draft until the menu's Apply button (or Enter), so both
   * bounds can be typed before anything is fetched. Closing the menu drops
   * the draft. Without it, each edit reports at once.
   */
  applyInMenu?: boolean;
}

// An empty or unparseable box is no bound, never NaN or a thrown error. A DATE
// range sends the picked calendar day (yyyy-mm-dd): converting local midnight
// to UTC moved it off the day the user chose.
const parseRangeInput = (
  rangeType: GeneratedRangeFilter["rangeType"],
  raw: string
): RangeValue | undefined => {
  if (raw === "") return undefined;
  if (rangeType === "NUMBER") {
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }
  if (rangeType === "DATE") {
    return DateTime.fromISO(raw).isValid ? raw : undefined;
  }
  if (rangeType === "DATETIME") {
    return DateTime.fromISO(raw).toUTC().toISO() ?? undefined;
  }
  return raw;
};

const RangeFilter = (props: InfiniteScrollRangeFilterProps) => {
  const [startValue, setStartValue] = useState<RangeValue | undefined>(
    props.filter.startValue
  );
  const [endValue, setEndValue] = useState<RangeValue | undefined>(
    props.filter.endValue
  );

  const [isOpen, setIsOpen] = useState(false);

  // Follow the filter when it changes from outside (a tag removed, Reset),
  // without undoing a draft in progress.
  useEffect(() => {
    setStartValue(props.filter.startValue);
  }, [props.filter.startValue]);

  useEffect(() => {
    setEndValue(props.filter.endValue);
  }, [props.filter.endValue]);

  const isDirty =
    startValue !== props.filter.startValue ||
    endValue !== props.filter.endValue;

  const commit = () => {
    props.onFilterChange({ ...props.filter, startValue, endValue });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open || !props.applyInMenu) return;
    setStartValue(props.filter.startValue);
    setEndValue(props.filter.endValue);
  };

  // Enter applies the draft here instead of reaching the filter bar.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!props.applyInMenu || e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    if (isDirty) commit();
  };

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
    if (!hasRangeValue(startValue)) return "";
    if (props.filter.rangeType === "DATE") {
      return DateTime.fromISO(startValue as string).toFormat("yyyy-MM-dd");
    } else if (props.filter.rangeType === "DATETIME") {
      return DateTime.fromISO(startValue as string).toFormat(
        "yyyy-MM-dd'T'HH:mm"
      );
    } else return startValue;
  }, [props.filter.rangeType, startValue]);

  const formattedEndValue = useMemo((): RangeValue => {
    if (!hasRangeValue(endValue)) return "";
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
      const newValue = parseRangeInput(props.filter.rangeType, e.target.value);
      setStartValue(newValue);
      if (props.applyInMenu) return;
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
      const newValue = parseRangeInput(props.filter.rangeType, e.target.value);
      setEndValue(newValue);
      if (props.applyInMenu) return;
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
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      <div className="k-filter-menu" onKeyDown={handleKeyDown}>
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
        {props.applyInMenu && (
          <div className="k-range-filter-menu-actions">
            <Button size="sm" disabled={!isDirty} onClick={commit}>
              Apply
            </Button>
          </div>
        )}
      </div>
    </Dropdown>
  );
};

export default RangeFilter;
