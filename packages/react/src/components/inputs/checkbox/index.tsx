"use client";

import MandatoryAsterisk from "../../forms/requiredAsterisk/index.js";
import "./styles.css";

interface CheckboxProps {
  label?: string | React.ReactNode;
  labelLocation?: "top" | "right" | "bottom" | "left";
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** if the checkbox is disabled */
  disabled?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
}

const Checkbox = (props: CheckboxProps) => {
  const { labelLocation = "top", disabled = false, required = false } = props;

  const inputId =
    props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

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
        onClick={props.onClick}
        onChange={props.onChange}
        className="k-checkbox"
        disabled={disabled}
      />
    </div>
  );
};

export default Checkbox;
