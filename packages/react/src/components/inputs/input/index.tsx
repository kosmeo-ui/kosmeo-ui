"use client";

import { faEye, faEyeSlash, faXmark } from "@fortawesome/free-solid-svg-icons";
import DropdownArrowButton from "../dropdownArrowButton/index.js";
import { ReactNode, useCallback, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FieldShell from "../../forms/fieldShell/index.js";
import { PropsWithSize } from "../../types.js";
import "./styles.css";

interface InputProps extends PropsWithSize {
  /**
   * **_Optional_** type of input field to render.
   *
   * Defaults to `text`
   */
  type?:
    | "text"
    | "number"
    | "password"
    | "email"
    | "date"
    | "datetime-local"
    | "time"
    | "url"
    | "tel";

  /** **_Optional_** if the field is disabled */
  disabled?: boolean;
  /** **_Optional_** if the field is read-only: unlike `disabled`, it stays focusable and is submitted */
  readOnly?: boolean;
  /** **_Optional_** if the field is a dropdown */
  dropDown?: boolean;
  /** **_Optional_** whether or not the drop down options are open */
  isOpen?: boolean;
  /** **_Optional_** label that appears above the input */
  label?: string;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** **_Optional_** placeholder text that will appear in the input until the user adds a value */
  placeholder?: string;
  /** **_Optional_** value to be set when the element first loads */
  value?: string | number;
  /** **_Optional_** reference to the input element */
  ref?: React.Ref<HTMLInputElement>;
  /** **_Optional_** maximum value for the input */
  max?: string | number;
  /** **_Optional_** minimum value for the input */
  min?: string | number;
  /** **_Optional_** whether to show character count */
  showCharCount?: boolean;
  /** **_Optional_** whether the input should be focused when it first loads */
  autoFocus?: boolean;
  /** **_Optional_** name attribute for the input (useful for form submissions) */
  name?: string;
  /** **_Optional_** autocomplete attribute for the input */
  autoComplete?: string;
  /** **_Optional_** inline addon rendered on the left (currency symbol, unit prefix). */
  prefix?: ReactNode;
  /** **_Optional_** inline addon rendered on the right (unit suffix, currency code). */
  suffix?: ReactNode;
  /** **_Optional_** error message rendered below the input (replaces helperText if both set). */
  error?: ReactNode;
  /** **_Optional_** helper text rendered below the input (hidden when `error` is set). */
  helperText?: ReactNode;
  /** **_Optional_** function that is called when the value of the input changes */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** **_Optional_** function that is called when the input is focused */
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  /** **_Optional_** function that is called when the input loses focus */
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  /** **_Optional_** function that is called when the user presses a key down in the input */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  /** **_Optional_** function that is called when the input is clicked */
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  /** **_Optional_** shows an × button at the end of a non-empty field; clear the value here. Sits at the right edge, so don't combine with `suffix` or `type="password"` */
  onClear?: () => void;
}

const Input = (props: InputProps) => {
  const {
    type = "text",
    size = "md",
    disabled = false,
    isOpen = false,
    required = false,
    prefix,
    suffix,
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { ref: forwardedRef } = props;

  // Keep our own handle on the input (the clear button refocuses it) while
  // still honouring a caller's `ref`.
  const setRefs = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef]
  );

  const showClear =
    !!props.onClear &&
    String(props.value ?? "") !== "" &&
    !disabled &&
    !props.readOnly;

  const handleClear = () => {
    props.onClear?.();
    // The button unmounts once the field is empty; keep focus in the field.
    inputRef.current?.focus();
  };

  const inputId =
    props.id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const hasAddon = prefix !== undefined || suffix !== undefined;
  const inputClasses = [
    "k-input",
    `k-input-${size}`,
    type === "password" && "k-input-password",
    props.onClear && "k-input-clearable",
    hasAddon && "k-input-with-addon",
    prefix !== undefined && "k-input-with-prefix",
    suffix !== undefined && "k-input-with-suffix",
  ]
    .filter(Boolean)
    .join(" ");

  const renderAddon = (content: ReactNode, side: "prefix" | "suffix") => (
    // Not aria-hidden: addons can be interactive (PhoneInput's country
    // picker), and text like "$" or "USD" is useful context. Icons hide
    // themselves.
    <span
      className={`k-input-addon k-input-addon-${side} k-input-addon-${size}`}
    >
      {content}
    </span>
  );

  const charCount =
    props.showCharCount && type === "text" ? (
      <>
        {String(props.value || "").length}
        {props.max && ` / ${props.max}`}
      </>
    ) : undefined;

  return (
    <FieldShell
      label={props.label}
      required={required}
      htmlFor={inputId}
      labelAside={charCount}
      error={props.error}
      helperText={props.helperText}
    >
      <div
        className={`k-input-wrapper${hasAddon ? " k-input-wrapper-addon" : ""}`}
      >
        {prefix !== undefined && renderAddon(prefix, "prefix")}
        <input
          ref={setRefs}
          id={inputId}
          name={props.name}
          type={inputType}
          placeholder={props.placeholder}
          value={props.value}
          max={props.max}
          min={props.min}
          required={required}
          autoFocus={props.autoFocus}
          autoComplete={props.autoComplete}
          disabled={disabled}
          readOnly={props.readOnly}
          onChange={props.onChange}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onClick={props.onClick}
          onKeyDown={props.onKeyDown}
          className={inputClasses}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="k-input-clear-button"
            aria-label="Clear"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
        {suffix !== undefined && renderAddon(suffix, "suffix")}
        {props.dropDown && (
          <DropdownArrowButton
            size={size}
            isOpen={isOpen}
            onClick={props.onClick}
          />
        )}
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="k-password-toggle-button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>
    </FieldShell>
  );
};

export default Input;
