"use client";

import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { SortDirection as SortDirectionType } from "../types.js";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import IconButton from "../../../buttons/iconButton/index.js";
import Dropdown from "../../../inputs/dropdown/index.js";
import { useState } from "react";
import "./styles.css";

interface DirectionSortProps {
  sortDirection?: SortDirectionType;
  handleSortDirectionChange: (sortDirection: SortDirectionType) => void;
}

const SortDirection = (props: DirectionSortProps) => {
  const { sortDirection, handleSortDirectionChange } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (direction: SortDirectionType) => {
    handleSortDirectionChange(direction);
    setIsOpen(false);
  };

  return (
    <Dropdown
      variant="secondary"
      align="right"
      size="sm"
      label={props.sortDirection === "asc" ? "Ascending" : "Descending"}
      aria-label={`Sort direction: ${props.sortDirection === "asc" ? "Ascending" : "Descending"}`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="k-infinite-scroll-dropdown-menu ">
        <IconButton
          variant="light"
          size="sm"
          align="left"
          shadow={false}
          icon={sortDirection === "asc" ? faCheckSquare : faSquare}
          onClick={() => handleSelect("asc")}
        >
          Ascending
        </IconButton>
        <IconButton
          variant="light"
          size="sm"
          align="left"
          shadow={false}
          icon={sortDirection === "desc" ? faCheckSquare : faSquare}
          onClick={() => handleSelect("desc")}
        >
          Descending
        </IconButton>
      </div>
    </Dropdown>
  );
};

export default SortDirection;
