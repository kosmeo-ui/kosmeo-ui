import useFloatingPosition from "../../../hooks/useFloatingPosition";
import useScrollIntoView from "../../../hooks/useScrollIntoView";
import { useEffect, useRef, useState, ReactNode } from "react";
import useListKeyboard from "../../../hooks/useListKeyboard";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { PropsWithSize } from "../../types";
import Portal from "../../overlays/portal";
import Input from "../input";
import "./styles.css";

interface TypeaheadRenderResult {
  /** The text label used for filtering and input display */
  label: string;
  /** The React component to render in the dropdown */
  node: ReactNode;
}

type TypeaheadPropsBase<T> = {
  /** The options that will be available to the user in the Typeahead */
  options: T[];
  /** Function that is called when the user selects an option */
  onSelect: (selectedOption: T | null, event?: React.MouseEvent) => void;
  /** **_Optional_** initial value to be pre-selected in the Typeahead */
  value?: T | null;
  /** **_Optional_** placeholder value to show in the input field before the user adds a value */
  placeholder?: string;
  /** **_Optional_** label to appear above the Typeahead */
  label?: string;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** if the typeahead is disabled */
  disabled?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** **_Optional_** if the drop down should be longer than default */
  longDropDown?: boolean;
  /** **_Optional_** optional function that will get the value of the filter input */
  onFilterChange?: (filterText: string) => void;
  /** **_Optional_** enables lazy loading - number of items to show initially and load on scroll */
  lazyLoad?: number;
  /** **_Optional_** if true, shows all options when dropdown opens before user starts typing */
  showAll?: boolean;
} & PropsWithSize;

type TypeaheadPropsWithLabelKey<T> = TypeaheadPropsBase<T> & {
  /** The key of the Options object that will be displayed to the user */
  labelKey: keyof T;
  /** Function to render custom option content */
  renderOption?: never;
};

type TypeaheadPropsWithRenderOption<T> = TypeaheadPropsBase<T> & {
  /** The key of the Options object that will be displayed to the user */
  labelKey?: never;
  /** Function to render custom option content and provide label text */
  renderOption: (option: T) => TypeaheadRenderResult;
};

type TypeaheadProps<T> =
  TypeaheadPropsWithLabelKey<T> | TypeaheadPropsWithRenderOption<T>;

/**
 * Typeahead component for filtering and selecting options from a dropdown list.
 *
 * @param options - Array of options to filter through.
 * @param labelKey - The key in each option object that will be displayed in the dropdown (use this OR renderOption).
 * @param renderOption - Function that returns both label text and custom React content (use this OR labelKey).
 * @param onSelect - Callback function that is called when an option is selected. Receives the selected option or `null` if no match.
 * @param label - **_Optional_** label to appear above the input field.
 * @param placeholder - **_Optional_** placeholder text for the input field.
 * @param value - **_Optional_** initial value to be pre-selected in the Typeahead. Should match the structure of the options.
 * @param size - **_Optional_** size for the typeahead input.
 * - Accepts `sm`, `md`, or `lg`.
 * - Defaults to `md`.
 */

const Typeahead = <T,>(props: TypeaheadProps<T>) => {
  const {
    size = "md",
    disabled = false,
    required = false,
    longDropDown = false,
    showAll = false,
  } = props;

  const getDisplayText = (option: T): string => {
    if (props.renderOption) return props.renderOption(option).label;
    else if (props.labelKey) return String(option[props.labelKey]);
    return "";
  };

  const getOptionContent = (option: T): ReactNode => {
    if (props.renderOption) return props.renderOption(option).node;
    else if (props.labelKey) return getDisplayText(option);
    return null;
  };

  const [inputValue, setInputValue] = useState<string>(
    props.value ? getDisplayText(props.value) : ""
  );
  const [filteredOptions, setFilteredOptions] = useState<T[]>([]);
  const [displayedOptions, setDisplayedOptions] = useState<T[]>([]);
  const [displayCount, setDisplayCount] = useState(props.lazyLoad || Infinity);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingOption = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { anchorRef: inputWrapperRef, position: dropdownPos } =
    useFloatingPosition({ isOpen });

  useEffect(() => {
    if (props.value) setInputValue(getDisplayText(props.value));
    else setInputValue("");
  }, [props.value, props.labelKey]);

  useEffect(() => {
    // When dropdown first opens with showAll and user hasn't typed yet, show all options
    if (inputValue && !showAll && !hasUserTyped) {
      const filtered = props.options.filter((option) =>
        getDisplayText(option).toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else if (!inputValue && !showAll && !hasUserTyped) {
      setDisplayedOptions(props.options);
    } else if (showAll && !hasUserTyped) {
      setFilteredOptions(props.options);
    } else if (inputValue && hasUserTyped) {
      // User is actively filtering
      const filtered = props.options.filter((option) =>
        getDisplayText(option).toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(props.options);
    }
    // Reset display count when filtering changes
    setDisplayCount(props.lazyLoad || Infinity);
  }, [
    inputValue,
    props.options,
    props.labelKey,
    props.lazyLoad,
    isOpen,
    showAll,
    hasUserTyped,
  ]);

  // Update displayed options based on lazy loading
  useEffect(() => {
    if (props.lazyLoad) {
      setDisplayedOptions(filteredOptions.slice(0, displayCount));
    } else setDisplayedOptions(filteredOptions);
  }, [filteredOptions, displayCount, props.lazyLoad]);

  useScrollIntoView(optionRefs, highlightedIndex, isOpen);

  useOutsideClick([dropdownRef, listRef], () => setIsOpen(false));

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const { lazyLoad } = props;
    if (!lazyLoad || !isOpen || !listRef.current) return;

    // Clean up previous observer
    if (observerRef.current) observerRef.current.disconnect();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && displayCount < filteredOptions.length) {
        setDisplayCount((prev) =>
          Math.min(prev + lazyLoad, filteredOptions.length)
        );
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: listRef.current,
      rootMargin: "50px",
      threshold: 0.1,
    });

    // Observe the last item or loading indicator
    const lastItem = listRef.current.querySelector(".k-typeahead-sentinel");
    if (lastItem) observerRef.current.observe(lastItem);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [
    isOpen,
    props.lazyLoad,
    displayCount,
    filteredOptions.length,
    displayedOptions,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasUserTyped(true);
    if (props.onFilterChange) props.onFilterChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (newValue === "") props.onSelect(null);
  };

  const handleOptionClick = (option: T, event?: React.MouseEvent) => {
    // If Ctrl/Cmd key is pressed, don't update the input value
    // Just call onSelect and let it handle opening in new tab
    if (event && (event.ctrlKey || event.metaKey)) {
      props.onSelect(option, event);
      setIsOpen(false);
      return;
    }

    isSelectingOption.current = true;
    setInputValue(getDisplayText(option));
    setHasUserTyped(false);
    props.onSelect(option, event);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setTimeout(() => {
      isSelectingOption.current = false;
    }, 150);
  };

  const handleInputClick = () => {
    if (disabled) return;
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      setHasUserTyped(false);
    }

    if (!inputValue) setFilteredOptions(props.options);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (isSelectingOption.current) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(document.activeElement)
      ) {
        setHighlightedIndex(-1);
        setIsOpen(false);

        const currentValueLabel = props.value
          ? getDisplayText(props.value)
          : "";
        if (inputValue === currentValueLabel) return;

        const exactMatch = props.options.find(
          (opt) =>
            getDisplayText(opt).toLowerCase() === inputValue.toLowerCase()
        );

        if (exactMatch) {
          props.onSelect(exactMatch);
          setInputValue(getDisplayText(exactMatch));
        } else if (inputValue === "") props.onSelect(null);
        else setInputValue(currentValueLabel);
      }
    }, 100);
  };

  const handleKeyDown = useListKeyboard({
    isOpen,
    length: displayedOptions.length,
    highlightedIndex,
    setHighlightedIndex,
    onSelect: (index) => handleOptionClick(displayedOptions[index]),
    onClose: () => setIsOpen(false),
    selectOnTab: true,
  });

  // Reset the refs array before each render
  optionRefs.current = [];

  const dropdownList =
    isOpen && dropdownPos ? (
      <ul
        ref={listRef}
        className={`k-typeahead-options-list k-typeahead-options-list-portal ${
          longDropDown ? "large" : "small"
        }`}
        style={{
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
        }}
      >
        {displayedOptions.length > 0 ? (
          <>
            {displayedOptions.map((option, index) => (
              <li
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                key={index}
                className={`k-typeahead-option k-typeahead-option-${size} ${
                  index === highlightedIndex
                    ? "k-typeahead-option-highlighted"
                    : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleOptionClick(option, e);
                }}
                onMouseOver={() => setHighlightedIndex(index)}
              >
                {getOptionContent(option)}
              </li>
            ))}
            {props.lazyLoad &&
              displayedOptions.length < filteredOptions.length && (
                <li className="k-typeahead-sentinel k-typeahead-loading">
                  Loading more...
                </li>
              )}
          </>
        ) : (
          <li
            className={`k-typeahead-no-results-item k-typeahead-option-${size}`}
          >
            {props.options.length === 0
              ? "No options available"
              : "No matches found"}
          </li>
        )}
      </ul>
    ) : null;

  return (
    <div className={`k-typeahead-dropdown-container`} ref={dropdownRef}>
      <div className="k-typeahead-input-wrapper" ref={inputWrapperRef}>
        <Input
          id={props.id}
          label={props.label}
          required={required}
          size={size}
          placeholder={props.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          isOpen={isOpen}
          disabled={disabled}
          dropDown={true}
        />
      </div>
      <Portal>{dropdownList}</Portal>
    </div>
  );
};

export default Typeahead;
