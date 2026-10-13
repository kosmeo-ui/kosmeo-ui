"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface InfoRowProps {
  label: ReactNode;
  value: ReactNode;
  /** Defaults to "horizontal" (label left, value right). "stacked" puts label above value. */
  layout?: "horizontal" | "stacked";
}

const InfoRow = ({ label, value, layout = "horizontal" }: InfoRowProps) => {
  return (
    <div className={`k-info-row k-info-row-${layout}`}>
      <div className="k-info-row-label">{label}</div>
      <div className="k-info-row-value">{value}</div>
    </div>
  );
};

export default InfoRow;
