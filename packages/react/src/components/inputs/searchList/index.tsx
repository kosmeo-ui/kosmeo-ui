"use client";

import useFloatingPosition from "../../../hooks/useFloatingPosition.js";
import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import useScrollIntoView from "../../../hooks/useScrollIntoView.js";
import useListKeyboard from "../../../hooks/useListKeyboard.js";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
import { useEffect, useId, useState, useRef } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import Spinner from "../../feedback/spinner/index.js";
import Portal from "../../overlays/portal/index.js";
import { PropsWithSize } from "../../types.js";
import Input from "../input/index.js";
import "./styles.css";

interface SearchListProps<T> extends PropsWithSize {
  /** **_Optional_** the selected value for this component */
  value?: T | null;
  /** The useQuery function that is used to retrieve the data from the server */
  queryFn: (
    input: string,
    searchKey: string,
    max: number
  ) => UseQueryResult<T[], Error>;
  /** The Function to run when the user selects an input */
  onSelect: (selectedOption: T | null, event?: React.MouseEvent) => void;
  placeholder?: string;
  /** **_Optional_** The max results to be returned  */
  max?: number;
  /** **_Optional_** label to appear above the Typeahead */
  label?: string;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** if the typeahead is disabled */
  disabled?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** The key that is used to access the label for the drop down list */
  labelKey: keyof T;
  /** The search key that will be sent to the server as a param */
  searchKey: string;
  /** **_Optional_** if the drop down should be longer than the default */
  longDropDown?: boolean;
  /** **_Optional_** Custom render function for dropdown options */
  renderOption?: (option: T) => {
    label: string;
    node: React.ReactNode;
  };
  /** **_Optional_** Options to show on focus before the user types */
  initialOptions?: T[];
}

const SearchList = <T,>(props: SearchListProps<T>) => {
  const {
    size = "md",
    required = false,
    disabled = false,
    longDropDown = false,
    max = 30,
  } = props;

  const [inputValue, setInputValue] = useState<string>(
    props.value ? String(props.value[props.labelKey]) : ""
  );
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listboxId = `${useId()}-listbox`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const { anchorRef: inputWrapperRef, position: dropdownPos } =
    useFloatingPosition({ isOpen });

  const query = props.queryFn(searchValue, props.searchKey, max);

  const debouncedInput = useDebouncedValue(inputValue, 500);
  const isTyping = inputValue !== debouncedInput && inputValue.length >= 3;

  useEffect(() => {
    if (props.value === null) {
      setInputValue("");
      setSearchValue("");
      setIsOpen(false);
    } else if (
      props.value &&
      String(props.value[props.labelKey]) !== inputValue
    ) {
      setInputValue(String(props.value[props.labelKey]));
    }
  }, [props.value]);

  useEffect(() => {
    if (inputValue.length === 0) {
      props.onSelect(null);
      if (!isOpen) setSearchValue("");
      return;
    }
    if (inputValue.length < 3) return;
    if (props.value && inputValue === String(props.value[props.labelKey])) {
      setSearchValue("");
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [inputValue]);

  useEffect(() => {
    if (debouncedInput.length < 3) {
      setSearchValue("");
      return;
    }
    if (props.value && debouncedInput === String(props.value[props.labelKey])) {
      setSearchValue("");
      return;
    }
    setSearchValue(debouncedInput);
  }, [debouncedInput]);

  useOutsideClick([dropdownRef, listRef], () => setIsOpen(false));

  useScrollIntoView(optionRefs, highlightedIndex, isOpen);

  const handleOptionClick = (option: T, event?: React.MouseEvent) => {
    setInputValue(String(option[props.labelKey]));
    props.onSelect(option, event);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const isLoading = isTyping || query.isLoading;
  const showsInitial = searchValue === "" && inputValue.length < 3;
  // The options on screen; the keyboard works only through these, never
  // through stale results hidden behind the spinner.
  const options =
    (isLoading
      ? undefined
      : showsInitial
        ? props.initialOptions
        : query.data) ?? [];
  const showList = isOpen && !!dropdownPos;
  const hasOptions = options.length > 0;

  const handleKeyDown = useListKeyboard({
    isOpen: isOpen && hasOptions,
    length: options.length,
    highlightedIndex,
    setHighlightedIndex,
    onSelect: (index) => {
      if (options[index]) handleOptionClick(options[index]);
    },
    onClose: () => setIsOpen(false),
  });

  const handleInputFocus = () => {
    if (inputValue.length >= 3) {
      setIsOpen(true);
      setSearchValue(inputValue);
    } else if (inputValue.length === 0) {
      setIsOpen(true);
      setSearchValue("");
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (isOpen) return;
      if (props.value) {
        setInputValue(String(props.value[props.labelKey]));
        props.onSelect(props.value);
      } else {
        setInputValue("");
      }
    }, 100);
  };

  optionRefs.current = [];

  const status = isLoading ? (
    <Spinner size="sm" />
  ) : showsInitial ? (
    "Start typing to search"
  ) : (
    "No results found"
  );

  const dropdownList = showList ? (
    <ul
      ref={listRef}
      // With no options the popup only holds a status message.
      {...(hasOptions
        ? {
            id: listboxId,
            role: "listbox",
            "aria-label": props.label ?? props.placeholder ?? "Type to search",
          }
        : { role: "presentation" })}
      className={`k-search-list-dropdown k-search-list-dropdown-portal ${
        longDropDown
          ? "k-search-list-dropdown-large"
          : "k-search-list-dropdown-small"
      }`}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
      }}
    >
      {hasOptions ? (
        <>
          {options.map((option, index) => {
            const rendered = props.renderOption
              ? props.renderOption(option)
              : null;
            return (
              <li
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                key={index}
                id={optionId(index)}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`k-search-list-option k-search-list-option-${size} ${
                  index === highlightedIndex
                    ? "k-search-list-option-highlighted"
                    : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOptionClick(option, e);
                }}
                onMouseOver={() => setHighlightedIndex(index)}
              >
                {rendered ? rendered.node : String(option[props.labelKey])}
              </li>
            );
          })}
          {/* A visual hint; a listbox may only contain options. */}
          <li
            className={`k-search-list-info k-search-list-info-${size}`}
            aria-hidden="true"
          >
            {showsInitial ? "Type to filter" : "Continue typing to filter"}
          </li>
        </>
      ) : isLoading ? (
        <li className="k-search-list-loading">{status}</li>
      ) : (
        <li
          role="status"
          className={`k-search-list-no-results k-search-list-no-results-${size}`}
        >
          {status}
        </li>
      )}
    </ul>
  ) : null;

  return (
    <div className="k-search-list-container" ref={dropdownRef}>
      <div ref={inputWrapperRef}>
        <Input
          id={props.id}
          label={props.label}
          required={required}
          disabled={disabled}
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={props.placeholder || "Type to search"}
          dropDown={true}
          isOpen={isOpen}
          size={size}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList && hasOptions ? listboxId : undefined}
          aria-activedescendant={
            showList && hasOptions && highlightedIndex > -1
              ? optionId(highlightedIndex)
              : undefined
          }
        />
      </div>
      <Portal>{dropdownList}</Portal>
    </div>
  );
};

export default SearchList;
