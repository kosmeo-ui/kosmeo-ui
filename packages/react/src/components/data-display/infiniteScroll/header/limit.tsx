"use client";

import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import IconButton from "../../../buttons/iconButton/index.js";
import { InfiniteScrollMenuLimitOption } from "../types.js";
import Dropdown from "../../../inputs/dropdown/index.js";
import { useEffect, useState } from "react";
import "./styles.css";

interface LimitProps {
  limitOptions: InfiniteScrollMenuLimitOption[];
  onLimitChange: (limitOptions: InfiniteScrollMenuLimitOption[]) => void;
}

const Limit = (props: LimitProps) => {
  const [limitOptions, setLimitOptions] = useState(props.limitOptions);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!props.limitOptions || props.limitOptions === limitOptions) return;
    setLimitOptions(props.limitOptions);
  }, [props.limitOptions, limitOptions]);

  const handleSelect = (value: number, selected: boolean) => {
    const newOptions = limitOptions.map((limit) => {
      if (limit.value === value) return { ...limit, selected };
      else return { ...limit, selected: false };
    });
    const oneSelected = newOptions.some((option) => option.selected);
    if (!oneSelected) return;
    setLimitOptions(newOptions);
    props.onLimitChange(newOptions);
    setIsOpen(false);
  };

  return (
    <div className="k-limit-container">
      <p>Results Per Page:</p>
      <Dropdown
        label={limitOptions.find((o) => o.selected)?.value || "None"}
        align="right"
        size="sm"
        variant="secondary"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className="k-infinite-scroll-dropdown-menu ">
          {limitOptions.map((key, index: number) => (
            <IconButton
              variant="light"
              size="sm"
              align="left"
              shadow={false}
              key={index}
              icon={key.selected ? faCheckSquare : faSquare}
              onClick={() => handleSelect(key.value, !key.selected)}
            >
              {key.value}
            </IconButton>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};

export default Limit;
