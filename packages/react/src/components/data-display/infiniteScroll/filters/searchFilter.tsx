"use client";

import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import Dropdown from "../../../inputs/dropdown/index.js";
import Button from "../../../buttons/button/index.js";
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

const SearchFilter = (props: InfiniteScrollSearchFilterProps) => {
  const [value, setValue] = useState<string>("");
  const [prevValue, setPrevValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (
      props.filter.value === prevValue ||
      (props.filter.value === undefined && prevValue === "")
    )
      return;
    setValue(props.filter.value || "");
    setPrevValue(props.filter.value || "");
    return;
  }, [props.filter.value, value, prevValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = useCallback(() => {
    setPrevValue(value);
    props.onFilterChange({ ...props.filter, value: value });
    setIsOpen(false);
  }, [value, props]);

  const handleKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

  const allowSubmit = useMemo(() => {
    return value !== prevValue;
  }, [value, prevValue]);

  return (
    <Dropdown
      label={props.filter.title}
      icon={faMagnifyingGlass}
      align="left"
      size="sm"
      variant="secondary"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="k-filter-menu">
        <Input
          size="sm"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeydown}
        />
        <Button size="sm" disabled={!allowSubmit} onClick={handleSubmit}>
          Add Filter
        </Button>
      </div>
    </Dropdown>
  );
};

export default SearchFilter;
