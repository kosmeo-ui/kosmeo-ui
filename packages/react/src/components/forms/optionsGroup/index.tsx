"use client";

import MandatoryAsterisk from "../requiredAsterisk/index.js";
import { ReactNode, useId } from "react";
import "./styles.css";

interface OptionsGroupProps {
  label?: string;
  required?: boolean;
  /** `radiogroup` for radios; `group` (the default) for checkboxes. */
  role?: "group" | "radiogroup";
  children: ReactNode;
}

/** Internal shell for CheckboxGroup / RadioGroup — label + option list. */
const OptionsGroup = ({
  label,
  required,
  role = "group",
  children,
}: OptionsGroupProps) => {
  const labelId = useId();
  return (
    <div
      className="k-options-group"
      role={role}
      aria-labelledby={label ? labelId : undefined}
      aria-required={(role === "radiogroup" && required) || undefined}
    >
      {label && (
        <label id={labelId} className="k-options-group-label">
          {label}
          {required && <MandatoryAsterisk />}
          {/* ARIA can't mark a checkbox group required, so say it. */}
          {required && role === "group" && (
            <span className="k-sr-only"> (required)</span>
          )}
        </label>
      )}
      <div className="k-options-group-options">{children}</div>
    </div>
  );
};

export default OptionsGroup;
