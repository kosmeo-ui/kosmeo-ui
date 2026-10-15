"use client";

import MandatoryAsterisk from "../../forms/requiredAsterisk/index.js";
import "./styles.css";

interface CheckboxProps {
  label?: string | React.ReactNode;
  labelLocation?: "top" | "right" | "bottom" | "left";
  checked: boolean;
  /** **_Optional_** only when `readOnly`, which never calls it */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** if the checkbox is disabled */
  disabled?: boolean;
  /** **_Optional_** if the checkbox is read-only: unlike `disabled`, it stays focusable and is announced as read-only */
  readOnly?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** **_Optional_** accessible name when there's no visible `label` (e.g. a row-select checkbox) */
  "aria-label"?: string;
}

const Checkbox = (props: CheckboxProps) => {
  const {
    labelLocation = "top",
    disabled = false,
    required = false,
    readOnly = false,
  } = props;

  const inputId =
    props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  // Browsers ignore `readonly` on checkboxes, so a click (or Space) is
  // cancelled here instead; aria-readonly tells assistive tech why.
  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (readOnly) event.preventDefault();
    props.onClick?.(event);
  };

  return (
    <div className={`k-checkbox-container k-${labelLocation}`}>
      {props.label && (
        <label className="k-checkbox-label" htmlFor={inputId}>
          {typeof props.label === "string" ? (
            <>
              {props.label}
              {required && <MandatoryAsterisk />}
            </>
          ) : (
            props.label
          )}
        </label>
      )}
      <input
        id={inputId}
        type="checkbox"
        required={required}
        checked={props.checked}
        onClick={handleClick}
        onChange={readOnly ? undefined : props.onChange}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-label={props["aria-label"]}
        className="k-checkbox"
        disabled={disabled}
      />
    </div>
  );
};

export default Checkbox;
