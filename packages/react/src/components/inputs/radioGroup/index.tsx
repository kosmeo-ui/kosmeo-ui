"use client";

import OptionsGroup from "../../forms/optionsGroup/index.js";
import { ReactNode } from "react";

export interface RadioOption<T = string> {
  value: T;
  label: ReactNode;
}

interface RadioGroupProps<T = string> {
  label?: string;
  name: string;
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  required?: boolean;
}

const RadioGroup = <T extends string = string>(props: RadioGroupProps<T>) => {
  const { disabled = false, required = false } = props;

  return (
    <OptionsGroup label={props.label} required={required} role="radiogroup">
      {props.options.map((option, index) => (
        <label key={index} className="k-options-group-option">
          <input
            type="radio"
            name={props.name}
            value={String(option.value)}
            checked={props.value === option.value}
            onChange={() => props.onChange(option.value)}
            disabled={disabled}
            required={required}
          />
          {option.label}
        </label>
      ))}
    </OptionsGroup>
  );
};

export default RadioGroup;
