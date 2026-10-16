"use client";

import useFloatingPosition from "../../../hooks/useFloatingPosition.js";
import useScrollIntoView from "../../../hooks/useScrollIntoView.js";
import useListKeyboard from "../../../hooks/useListKeyboard.js";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
import { ReactNode, useEffect, useRef, useState } from "react";
import Portal from "../../overlays/portal/index.js";
import { PropsWithSize } from "../../types.js";
import Input from "../input/index.js";
import "../searchList/styles.css";

interface SearchSelectProps<T> extends PropsWithSize {
  /** **_Optional_** label above the field. */
  label?: string;
  /** The currently selected option, or null. */
  value: T | null;
  /** In-memory options to choose from (filtered client-side as the user types). */
  options: T[];
  /** Visible label for an option. */
  getOptionLabel: (option: T) => string;
  /** Stable React key for an option. */
  getOptionKey: (option: T) => string;
  /** Fired ONLY on an explicit pick — never on blur, so it can't clobber edits. */
  onSelect: (option: T) => void;
  /** **_Optional_** custom dropdown row renderer. */
  renderOption?: (option: T) => ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  longDropDown?: boolean;
}

const SearchSelect = <T,>(props: SearchSelectProps<T>) => {
  const {
    size = "md",
    required = false,
    disabled = false,
    longDropDown = false,
  } = props;

  const selectedLabel = props.value ? props.getOptionLabel(props.value) : "";
  const selectedLabelRef = useRef(selectedLabel);
  selectedLabelRef.current = selectedLabel;

  const [inputValue, setInputValue] = useState(selectedLabel);
  const [isOpen, setIsOpen] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const { anchorRef: inputWrapperRef, position: dropdownPos } =
    useFloatingPosition({ isOpen });

  useEffect(() => {
    setInputValue(selectedLabel);
    setFiltering(false);
  }, [selectedLabel]);

  const filterText = inputValue.trim().toLowerCase();
  const filtered =
    filtering && filterText
      ? props.options.filter((o) =>
          props.getOptionLabel(o).toLowerCase().includes(filterText)
        )
      : props.options;

  const restore = () => {
    setInputValue(selectedLabelRef.current);
    setFiltering(false);
    setIsOpen(false);
  };

  useOutsideClick([dropdownRef, listRef], restore);
  useScrollIntoView(optionRefs, highlightedIndex, isOpen);

  const choose = (option: T) => {
    props.onSelect(option);
    setInputValue(props.getOptionLabel(option));
    setFiltering(false);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = useListKeyboard({
    isOpen,
    length: filtered.length,
    highlightedIndex,
    setHighlightedIndex,
    onSelect: (i) => {
      if (filtered[i]) choose(filtered[i]);
    },
    onClose: () => setIsOpen(false),
  });

  optionRefs.current = [];

  const dropdownList =
    isOpen && dropdownPos ? (
      <ul
        ref={listRef}
        className={`k-search-list-dropdown k-search-list-dropdown-portal ${
          longDropDown ? "large" : "small"
        }`}
        style={{
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((option, index) => (
            <li
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              key={props.getOptionKey(option)}
              className={`k-search-list-option k-search-list-option-${size} ${
                index === highlightedIndex
                  ? "k-search-list-option-highlighted"
                  : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(option);
              }}
              onMouseOver={() => setHighlightedIndex(index)}
            >
              {props.renderOption
                ? props.renderOption(option)
                : props.getOptionLabel(option)}
            </li>
          ))
        ) : (
          <li
            className={`k-search-list-no-results k-search-list-no-results-${size}`}
          >
            No results found
          </li>
        )}
      </ul>
    ) : null;

  return (
    <div className="k-search-list-container" ref={dropdownRef}>
      <div ref={inputWrapperRef}>
        <Input
          label={props.label}
          required={required}
          disabled={disabled}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setFiltering(true);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(restore, 100);
          }}
          placeholder={props.placeholder || "Select..."}
          dropDown={true}
          isOpen={isOpen}
          size={size}
        />
      </div>
      <Portal>{dropdownList}</Portal>
    </div>
  );
};

export default SearchSelect;
