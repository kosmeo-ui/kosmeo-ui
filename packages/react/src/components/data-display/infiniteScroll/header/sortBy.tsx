"use client";

import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import IconButton from "../../../buttons/iconButton/index.js";
import { InfiniteScrollMenuSortDataKey } from "../types.js";
import Dropdown from "../../../inputs/dropdown/index.js";
import { useState } from "react";
import "./styles.css";

interface SortbyProps {
  sortBy: InfiniteScrollMenuSortDataKey[];
  handleSortByChange: (sortBy: InfiniteScrollMenuSortDataKey[]) => void;
}

const SortBy = (props: SortbyProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (dataKey: string, selected: boolean) => {
    const newOptions = props.sortBy.map((item) => {
      if (item.dataKey === dataKey) return { ...item, selected };
      else return { ...item, selected: false };
    });
    props.handleSortByChange(newOptions);
    setIsOpen(false);
  };

  return (
    <Dropdown
      align="right"
      size="sm"
      variant="secondary"
      label={props.sortBy.find((key) => key.selected)?.displayName || "None"}
      aria-label={`Sort by: ${props.sortBy.find((key) => key.selected)?.displayName || "None"}`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="k-infinite-scroll-dropdown-menu ">
        {props.sortBy.map((key, index: number) => (
          <IconButton
            key={index}
            variant="light"
            size="sm"
            align="left"
            shadow={false}
            icon={key.selected ? faCheckSquare : faSquare}
            onClick={() => handleSelect(key.dataKey, !key.selected)}
          >
            {key.displayName}
          </IconButton>
        ))}
      </div>
    </Dropdown>
  );
};

export default SortBy;
