"use client";

import MandatoryAsterisk from "../requiredAsterisk/index.js";
import { ReactNode } from "react";
import "./styles.css";

interface FieldShellProps {
  /** Field label rendered above the input. */
  label?: ReactNode;
  /** Whether the field is required — shows asterisk next to a string label. */
  required?: boolean;
  /** `htmlFor` target id, used when label is a string. */
  htmlFor?: string;
  /** Id for the label element, for a control named with `aria-labelledby` (a `<label>` can't target a non-form element). */
  labelId?: string;
  /** Optional right-aligned annotation in the label row (e.g. char count). */
  labelAside?: ReactNode;
  /** Optional error message rendered below the input. */
  error?: ReactNode;
  /** Optional helper text rendered below the input (hidden when `error` is set). */
  helperText?: ReactNode;
  /** Id for the error or helper text, for the control's `aria-describedby`. */
  messageId?: string;
  /** The input element itself. */
  children: ReactNode;
  /** Internal-only: additional class for sibling ui-component shells to apply field-type modifiers. */
  className?: string;
}

/** Shared shell for form fields — label + asterisk + optional char count + error/helper. */
const FieldShell = ({
  label,
  required,
  htmlFor,
  labelId,
  labelAside,
  error,
  helperText,
  messageId,
  children,
  className = "",
}: FieldShellProps) => (
  <div className={`k-field-shell ${className}`.trim()}>
    {(label || labelAside) && (
      <div className="k-field-shell-label-row">
        {label && (
          <label id={labelId} htmlFor={htmlFor} className="k-field-shell-label">
            {typeof label === "string" ? (
              <>
                {label}
                {required && <MandatoryAsterisk />}
              </>
            ) : (
              label
            )}
          </label>
        )}
        {labelAside && (
          <span className="k-field-shell-aside">{labelAside}</span>
        )}
      </div>
    )}
    {children}
    {error ? (
      <div id={messageId} className="k-field-shell-error">
        {error}
      </div>
    ) : helperText ? (
      <div id={messageId} className="k-field-shell-helper">
        {helperText}
      </div>
    ) : null}
  </div>
);

export default FieldShell;
