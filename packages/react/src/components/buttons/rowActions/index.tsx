"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface RowActionsProps {
  children: ReactNode;
  /** Horizontal alignment. Defaults to "center" (DataTable cell convention). */
  align?: "start" | "center" | "end";
  /** Gap between items. Defaults to "xs" = 0.25rem. */
  gap?: "xs" | "sm" | "md";
}

const RowActions = ({
  children,
  align = "center",
  gap = "xs",
}: RowActionsProps) => {
  const classes = [
    "k-row-actions",
    `k-row-actions-${align}`,
    `k-row-actions-gap-${gap}`,
  ].join(" ");
  // Actions sit inside clickable rows; a click on one is not a row click.
  return (
    <div className={classes} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
};

export default RowActions;
