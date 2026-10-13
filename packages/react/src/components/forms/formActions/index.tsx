"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface FormActionsProps {
  children: ReactNode;
  /** Defaults to "right". "between" for split (cancel left, submit right).
   * "fill" makes the buttons split the row evenly (equal width side-by-side),
   * e.g. a Deny/Allow pair. */
  align?: "right" | "between" | "center" | "left" | "fill";
  /** Margin-top size. Defaults to "md". */
  spacing?: "sm" | "md" | "lg" | "none";
}

const FormActions = ({
  children,
  align = "right",
  spacing = "md",
}: FormActionsProps) => {
  return (
    <div
      className={`k-form-actions k-form-actions-${align} k-form-actions-spacing-${spacing}`}
    >
      {children}
    </div>
  );
};

export default FormActions;
