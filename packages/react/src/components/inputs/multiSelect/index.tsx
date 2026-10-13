import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef, useEffect, useMemo } from "react";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import DropdownArrowButton from "../dropdownArrowButton";
import FieldShell from "../../forms/fieldShell";
import { DropDownSection } from "./dropDown";
import { PropsWithSize } from "../../types";
import "./styles.css";

interface MultiSelectProps<T> extends PropsWithSize {
  /** Array of options to display */
  options: T[];
  /** Currently selected values */
  value?: T[];
  /** The key of the Options object that will be displayed to the user */
  labelKey: keyof T;
  /** Callback when selection changes */
  onChange?: (values: T[]) => void;
  /** Label to display above the component */
  label?: string | React.ReactNode;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** Placeholder text when no items are selected */
  placeholder?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** ID for the component */
  id?: string;
}

/**
 * MultiSelect component with search functionality for selecting multiple options.
 * Supports searching through options with a built-in filter.
 *
 * @param props - The props for the MultiSelect component
 * @param props.options - Array of options to display
 * @param props.value - Currently selected values
 * @param props.onChange - Callback when selection changes
 * @param props.label - **_Optional_** Label to display above the component
 * @param props.placeholder - **_Optional_** Placeholder text when no items are selected
 * @param props.disabled - **_Optional_** Whether the component is disabled
 * @param props.id - **_Optional_** ID for the component
 * @param props.size - **_Optional_** Size variant ("sm" | "md" | "lg"). Defaults to "md"
 */
const MultiSelect = <T,>(props: MultiSelectProps<T>) => {
  const {
    value = [],
    placeholder = "Select options...",
    disabled = false,
    size = "md",
    required = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(props.options);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const componentId =
    props.id || `multiselect-${Math.random().toString(36).substring(2, 9)}`;

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = props.options.filter((option) =>
        String(option[props.labelKey])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(props.options);
    }
  }, [searchTerm, props.options]);

  useOutsideClick([containerRef], () => setIsOpen(false));

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleOptionToggle = (optionValue: T) => {
    if (!props.onChange) return;

    const isAlreadySelected = value.some((v) => {
      if (
        typeof v === "object" &&
        v !== null &&
        "value" in v &&
        typeof optionValue === "object" &&
        optionValue !== null &&
        "value" in optionValue
      ) {
        return (
          (v as { value: unknown }).value ===
          (optionValue as { value: unknown }).value
        );
      }
      return v === optionValue;
    });

    const newValues = isAlreadySelected
      ? value.filter((v) => {
          if (
            typeof v === "object" &&
            v !== null &&
            "value" in v &&
            typeof optionValue === "object" &&
            optionValue !== null &&
            "value" in optionValue
          ) {
            return (
              (v as { value: unknown }).value !==
              (optionValue as { value: unknown }).value
            );
          }
          return v !== optionValue;
        })
      : [...value, optionValue];

    props.onChange(newValues);
  };

  const handleSelectAll = () => {
    if (!props.onChange) return;

    const existingMap = new Map();
    value.forEach((v) => {
      if (typeof v === "object" && v !== null && "value" in v) {
        existingMap.set((v as { value: unknown }).value, v);
      } else {
        existingMap.set(v, v);
      }
    });

    const newValues = [...value];
    filteredOptions.forEach((option) => {
      const key =
        typeof option === "object" && option !== null && "value" in option
          ? (option as { value: unknown }).value
          : option;

      if (!existingMap.has(key)) {
        newValues.push(option);
      }
    });

    props.onChange(newValues);
  };

  const handleClearAll = () => {
    if (!props.onChange) return;
    props.onChange([]);
  };

  const selectedItems = useMemo(() => {
    return value.map((v) => {
      const key = Math.random().toString(36).slice(2);
      return (
        <div key={key} className="k-multiselect-selected-item">
          <span className="k-multiselect-selected-item-label">
            {String(v[props.labelKey])}
          </span>
          {!disabled && (
            <button
              type="button"
              className="k-multiselect-selected-item-remove"
              onClick={(e) => {
                e.stopPropagation();
                handleOptionToggle(v);
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      );
    });
  }, [value]);

  return (
    <div ref={containerRef}>
      <FieldShell
        label={props.label}
        required={required}
        htmlFor={componentId}
        className="k-multiselect-container"
      >
        <div
          id={componentId}
          className={`k-multiselect k-multiselect-${size} ${
            disabled ? "k-multiselect-disabled" : ""
          } ${isOpen ? "k-multiselect-open" : ""}`}
          onClick={handleToggleDropdown}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="k-multiselect-display">
            {value.length > 0 ? (
              <div className="k-multiselect-selected-items">
                {selectedItems}
              </div>
            ) : (
              <span className="k-multiselect-placeholder">{placeholder}</span>
            )}
          </div>
          <DropdownArrowButton
            size={size}
            isOpen={isOpen}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDropdown();
            }}
          />
        </div>
        {isOpen && (
          <DropDownSection
            value={value}
            labelKey={props.labelKey}
            size={size}
            searchTerm={searchTerm}
            searchInputRef={searchInputRef}
            filteredOptions={filteredOptions}
            options={props.options}
            setSearchTerm={setSearchTerm}
            handleSelectAll={handleSelectAll}
            handleClearAll={handleClearAll}
            handleOptionToggle={handleOptionToggle}
          />
        )}
      </FieldShell>
    </div>
  );
};

export default MultiSelect;
