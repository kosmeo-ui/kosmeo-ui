"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  children: ReactNode;
}

const FormGrid = ({ columns = 2, gap = "md", children }: FormGridProps) => {
  return (
    <div
      className={`k-form-grid k-form-grid-${columns}col k-form-grid-gap-${gap}`}
    >
      {children}
    </div>
  );
};

export default FormGrid;
