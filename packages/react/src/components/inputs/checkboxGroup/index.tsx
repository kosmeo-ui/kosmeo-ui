import OptionsGroup from "../../forms/optionsGroup";
import Checkbox from "../checkbox";
import { ReactNode } from "react";

export interface CheckboxOption<T = string> {
  value: T;
  label: ReactNode;
}

interface CheckboxGroupProps<T = string> {
  label?: string;
  name: string;
  options: CheckboxOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
  required?: boolean;
}

const CheckboxGroup = <T extends string = string>(
  props: CheckboxGroupProps<T>
) => {
  const { disabled = false, required = false } = props;

  const handleToggle = (value: T) => {
    const newValues = props.values.includes(value)
      ? props.values.filter((v) => v !== value)
      : [...props.values, value];
    props.onChange(newValues);
  };

  return (
    <OptionsGroup label={props.label} required={required}>
      {props.options.map((option, index) => (
        <Checkbox
          key={index}
          checked={props.values.includes(option.value)}
          onChange={() => handleToggle(option.value)}
          label={option.label}
          labelLocation="right"
          disabled={disabled}
        />
      ))}
    </OptionsGroup>
  );
};

export default CheckboxGroup;
