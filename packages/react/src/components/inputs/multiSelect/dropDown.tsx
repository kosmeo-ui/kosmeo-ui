"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../../buttons/iconButton/index.js";
import Tooltip from "../../feedback/tooltip/index.js";
import { PropsWithSize } from "../../types.js";
import Input from "../input/index.js";
import { useMemo } from "react";
import {
  faCheckDouble,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface DropDownProps<T> extends PropsWithSize {
  value: T[];
  searchTerm: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  filteredOptions: T[];
  options: T[];
  labelKey: keyof T;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleSelectAll: () => void;
  handleClearAll: () => void;
  handleOptionToggle: (optionValue: T) => void;
}

export const DropDownSection = <T,>(props: DropDownProps<T>) => {
  const { size = "md", value = [] } = props;

  const list = useMemo(() => {
    return props.filteredOptions.length > 0 ? (
      props.filteredOptions.map((option) => {
        const isSelected = value.find(
          (v) => v[props.labelKey] === option[props.labelKey]
        );
        const key = Math.random().toString(36).slice(2);
        return (
          <li
            key={key}
            className={`k-multiselect-option k-multiselect-option-${size} ${
              isSelected ? "k-multiselect-option-selected" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              props.handleOptionToggle(option);
            }}
          >
            <span className="k-multiselect-option-label">
              {String(option[props.labelKey])}
            </span>
            {isSelected && (
              <FontAwesomeIcon icon={faCheck} className="k-multiselect-check" />
            )}
          </li>
        );
      })
    ) : (
      <li className={`k-multiselect-no-results k-multiselect-option-${size}`}>
        {props.options.length === 0
          ? "No options available"
          : "No options found"}
      </li>
    );
  }, [props.filteredOptions, value]);

  return (
    <div className={`k-multiselect-dropdown k-multiselect-dropdown-${size}`}>
      <div className="k-multiselect-search-container">
        <Input
          ref={props.searchInputRef}
          type="text"
          placeholder="Search options..."
          size={props.size}
          value={props.searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            props.setSearchTerm(e.target.value)
          }
          onClick={(e: React.MouseEvent<HTMLInputElement>) =>
            e.stopPropagation()
          }
        />
        <div className="k-multiselect-bulk-actions">
          <Tooltip content="Select All">
            <IconButton
              icon={faCheckDouble}
              size={size}
              variant="success"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                props.handleSelectAll();
              }}
              disabled={value.length === props.options.length}
            />
          </Tooltip>
          <Tooltip content="Clear All">
            <IconButton
              icon={faXmark}
              size={size}
              variant="danger"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                props.handleClearAll();
              }}
              disabled={value.length === 0}
            />
          </Tooltip>
        </div>
      </div>

      <ul className="k-multiselect-options-list">{list}</ul>
    </div>
  );
};
