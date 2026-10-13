"use client";

import "./styles.css";

interface SwitchProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelLocation?: "left" | "right";
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md";
  id?: string;
}

const Switch = (props: SwitchProps) => {
  const {
    labelLocation = "right",
    disabled = false,
    isLoading = false,
    size = "md",
  } = props;

  const inputId =
    props.id || `switch-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`k-switch-container k-switch-${labelLocation}`}>
      {props.label && labelLocation === "left" && (
        <label className="k-switch-label" htmlFor={inputId}>
          {props.label}
        </label>
      )}
      <div
        className={`k-switch-track k-switch-${size}${props.checked ? " k-switch-on" : ""}${disabled || isLoading ? " k-switch-disabled" : ""}${isLoading ? " k-switch-loading" : ""}`}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={props.checked}
          onChange={props.onChange}
          disabled={disabled || isLoading}
          className="k-switch-input"
        />
        <span className="k-switch-thumb" />
      </div>
      {props.label && labelLocation === "right" && (
        <label className="k-switch-label" htmlFor={inputId}>
          {props.label}
        </label>
      )}
    </div>
  );
};

export default Switch;
