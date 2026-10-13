"use client";

import FieldShell from "../../forms/fieldShell/index.js";
import { ChangeEvent } from "react";
import "./styles.css";
import {
  dateInputToIso,
  dateTimeLocalToIso,
  toDateInputValue,
  toDateTimeLocalValue,
} from "./utils.js";

export interface DateInputBaseProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  id?: string;
  name?: string;
}

export interface DateInputProps extends DateInputBaseProps {
  /** Accepts an ISO string or `Date`. Empty string and null both mean "no value". */
  value: string | Date | null;
  /** Fires with an ISO date-time string (start-of-day) or `null` when cleared. */
  onChange: (iso: string | null) => void;
}

export interface DateTimeInputProps extends DateInputBaseProps {
  value: string | Date | null;
  onChange: (iso: string | null) => void;
}

export interface TimeInputProps extends DateInputBaseProps {
  /** `HH:mm` (24-hour). */
  value: string | null;
  onChange: (time: string | null) => void;
}

export const DateInput = ({
  value,
  onChange,
  label,
  required,
  error,
  helperText,
  disabled,
  min,
  max,
  id,
  name,
}: DateInputProps) => {
  const handle = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(dateInputToIso(e.target.value));
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      htmlFor={id}
    >
      <input
        id={id}
        name={name}
        type="date"
        value={toDateInputValue(value)}
        onChange={handle}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
        className="k-date-input-field"
      />
    </FieldShell>
  );
};

export const DateTimeInput = ({
  value,
  onChange,
  label,
  required,
  error,
  helperText,
  disabled,
  min,
  max,
  id,
  name,
}: DateTimeInputProps) => {
  const handle = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(dateTimeLocalToIso(e.target.value));
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      htmlFor={id}
    >
      <input
        id={id}
        name={name}
        type="datetime-local"
        value={toDateTimeLocalValue(value)}
        onChange={handle}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
        className="k-date-input-field"
      />
    </FieldShell>
  );
};

export const TimeInput = ({
  value,
  onChange,
  label,
  required,
  error,
  helperText,
  disabled,
  min,
  max,
  id,
  name,
}: TimeInputProps) => {
  const handle = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value || null);
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      htmlFor={id}
    >
      <input
        id={id}
        name={name}
        type="time"
        value={value ?? ""}
        onChange={handle}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
        className="k-date-input-field"
      />
    </FieldShell>
  );
};
