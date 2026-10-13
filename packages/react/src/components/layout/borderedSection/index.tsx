"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface BorderedSectionProps {
  children: ReactNode;
  /** Optional title shown above the body. */
  title?: ReactNode;
  /** Right-aligned actions in the title row. Implies a title row even when `title` is empty. */
  actions?: ReactNode;
  /** Body layout. `"stack"` (default) stacks children; `"row"` lays them out as a horizontal flex strip. */
  layout?: "stack" | "row";
  /** Gap between children when `layout="row"`. */
  gap?: "sm" | "md";
  /** When true, applies `min-width: 0` so the section can shrink inside a flex parent. */
  minWidth0?: boolean;
}

const BorderedSection = ({
  children,
  title,
  actions,
  layout = "stack",
  gap,
  minWidth0,
}: BorderedSectionProps) => {
  const classes = [
    "k-bordered-section",
    `k-bordered-section-layout-${layout}`,
    gap ? `k-bordered-section-gap-${gap}` : "",
    minWidth0 ? "k-bordered-section-min-width-0" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const showHeader = title !== undefined || actions !== undefined;

  return (
    <div className={classes}>
      {showHeader && (
        <div className="k-bordered-section-header">
          {title !== undefined && (
            <h3 className="k-bordered-section-title">{title}</h3>
          )}
          {actions !== undefined && (
            <div className="k-bordered-section-actions">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default BorderedSection;
