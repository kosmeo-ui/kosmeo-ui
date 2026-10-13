"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface EmptyStateProps {
  children: ReactNode;
  /** "inline" = small grey text suitable inside a list (default). "block" = padded, centered. */
  layout?: "inline" | "block";
  icon?: ReactNode;
  /** Call-to-action rendered below children. Only used with layout="block". */
  action?: ReactNode;
}

const EmptyState = ({
  children,
  layout = "inline",
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className={`k-empty-state k-empty-state-${layout}`}>
      {icon && <div className="k-empty-state-icon">{icon}</div>}
      <div className="k-empty-state-body">{children}</div>
      {layout === "block" && action && (
        <div className="k-empty-state-action">{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
