import FieldShell from "../../forms/fieldShell";
import { PropsWithSize } from "../../types";
import { useLayoutEffect } from "react";
import "./styles.css";

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SelectProps<T = string> extends PropsWithSize {
  /** **_Optional_** if the field is disabled */
  disabled?: boolean;
  /** **_Optional_** label that appears above the select */
  label?: string;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** **_Optional_** placeholder text for the first option */
  placeholder?: string;
  /** **_Optional_** current selected value */
  value?: T;
  /** **_Optional_** options to display in the select */
  options: SelectOption<T>[];
  /** **_Optional_** function that is called when the value changes */
  onChange?: (value: T | undefined) => void;
  /** **_Optional_** function that is called when the select is focused */
  onFocus?: React.FocusEventHandler<HTMLSelectElement>;
  /** **_Optional_** function that is called when the select loses focus */
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
}

const Select = <T extends string = string>(props: SelectProps<T>) => {
  const { size = "md", disabled = false, required = false } = props;

  const selectId =
    props.id || `select-${Math.random().toString(36).substring(2, 9)}`;

  const selectClasses = ["k-select", `k-select-${size}`]
    .filter(Boolean)
    .join(" ");

  // When no value matches any option and there's no placeholder,
  // the browser displays the first option but React state is out of sync.
  // Fire onChange synchronously (layout effect) so parent state is updated
  // before other effects run.
  useLayoutEffect(() => {
    if (!props.onChange || props.options.length === 0) return;
    const currentValue = props.value || "";
    const hasMatch =
      props.options.some((o) => String(o.value) === String(currentValue)) ||
      (props.placeholder && currentValue === "");
    if (!hasMatch) {
      props.onChange(props.options[0].value);
    }
  }, [props.options, props.value, props.placeholder]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (props.onChange) {
      props.onChange(selectedValue === "" ? undefined : (selectedValue as T));
    }
  };

  return (
    <FieldShell
      label={props.label}
      required={required}
      htmlFor={selectId}
      className="k-select-container"
    >
      <div className="k-select-wrapper">
        <select
          id={selectId}
          value={props.value || ""}
          required={required}
          disabled={disabled}
          onChange={handleChange}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          className={selectClasses}
        >
          {props.placeholder && (
            <option value="" disabled={required}>
              {props.placeholder}
            </option>
          )}
          {props.options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </FieldShell>
  );
};

export default Select;
