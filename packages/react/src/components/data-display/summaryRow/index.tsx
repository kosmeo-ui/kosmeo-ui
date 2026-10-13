"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface SummaryRowItem {
  label: ReactNode;
  value: ReactNode;
}

export interface SummaryRowProps {
  items: SummaryRowItem[];
}

const SummaryRow = ({ items }: SummaryRowProps) => {
  return (
    <div className="k-summary-row">
      {items.map((item, i) => (
        <div key={i} className="k-summary-row-cell">
          <span className="k-summary-row-label">{item.label}</span>
          <span className="k-summary-row-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default SummaryRow;
