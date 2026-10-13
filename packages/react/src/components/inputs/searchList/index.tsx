"use client";

import useFloatingPosition from "../../../hooks/useFloatingPosition.js";
import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import useScrollIntoView from "../../../hooks/useScrollIntoView.js";
import useListKeyboard from "../../../hooks/useListKeyboard.js";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
import { UseQueryResult } from "@tanstack/react-query";
import Spinner from "../../feedback/spinner/index.js";
import { useEffect, useState, useRef } from "react";
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

  const activeOptions =
    searchValue === "" && inputValue.length < 3
      ? props.initialOptions
      : query.data;

  const handleKeyDown = useListKeyboard({
    isOpen: isOpen && !!activeOptions,
    length: activeOptions?.length ?? 0,
    highlightedIndex,
    setHighlightedIndex,
    onSelect: (index) => {
      if (activeOptions?.[index]) handleOptionClick(activeOptions[index]);
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

  const dropdownList =
    isOpen && dropdownPos ? (
      <ul
        ref={listRef}
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
        {isTyping || query.isLoading ? (
          <li className="k-search-list-loading">
            <Spinner size="sm" />
          </li>
        ) : searchValue === "" && inputValue.length < 3 ? (
          props.initialOptions && props.initialOptions.length > 0 ? (
            <>
              {props.initialOptions.map((option, index) => {
                const rendered = props.renderOption
                  ? props.renderOption(option)
                  : null;
                return (
                  <li
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    key={index}
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
              <li className={`k-search-list-info k-search-list-info-${size}`}>
                Type to filter
              </li>
            </>
          ) : (
            <li
              className={`k-search-list-no-results k-search-list-no-results-${size}`}
            >
              Start typing to search
            </li>
          )
        ) : query.data && query.data.length > 0 ? (
          <>
            {query.data.map((option, index) => {
              const rendered = props.renderOption
                ? props.renderOption(option)
                : null;
              return (
                <li
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  key={index}
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
            <li className={`k-search-list-info k-search-list-info-${size}`}>
              Continue typing to filter
            </li>
          </>
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
            const newValue = e.target.value;
            setInputValue(newValue);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={props.placeholder || "Type to search"}
          dropDown={true}
          isOpen={isOpen}
          size={size}
        />
      </div>
      <Portal>{dropdownList}</Portal>
    </div>
  );
};

export default SearchList;
