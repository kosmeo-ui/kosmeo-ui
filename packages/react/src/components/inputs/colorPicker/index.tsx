"use client";

import Input from "../input/index.js";
import { ChangeEvent } from "react";
import "./styles.css";

export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  placeholder?: string;
  error?: string;
  /** Allow empty string (no color). Defaults to false. */
  allowEmpty?: boolean;
  required?: boolean;
  /** Override the default validation error message. */
  invalidMessage?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_INVALID_MESSAGE = "Color must be #RRGGBB (e.g. #A1B2C3)";

const ColorPicker = ({
  label,
  value,
  onChange,
  placeholder = "#A1B2C3",
  error,
  allowEmpty = false,
  required,
  invalidMessage = DEFAULT_INVALID_MESSAGE,
}: ColorPickerProps) => {
  const trimmed = value.trim();
  const isEmpty = trimmed === "";
  const isValid = HEX_RE.test(trimmed);
  const internalError =
    !isValid && !(allowEmpty && isEmpty) && trimmed.length > 0
      ? invalidMessage
      : undefined;
  const swatchValue = isValid ? trimmed : "#000000";
  const displayError = error ?? internalError;

  const handleSwatchChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value);

  return (
    <div className="k-color-picker">
      {label && (
        <label className="k-color-picker-label">
          {label}
          {required && <span aria-hidden> *</span>}
        </label>
      )}
      <div className="k-color-picker-row">
        <input
          type="color"
          aria-label={label ? `${label} swatch` : "Color swatch"}
          value={swatchValue}
          onChange={handleSwatchChange}
          className="k-color-picker-swatch"
        />
        <div className="k-color-picker-input">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
      </div>
      {displayError && (
        <div className="k-color-picker-error">{displayError}</div>
      )}
    </div>
  );
};

export default ColorPicker;
