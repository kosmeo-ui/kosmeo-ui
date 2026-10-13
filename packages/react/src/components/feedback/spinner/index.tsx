"use client";

import { PropsWithSize, PropsWithVariant } from "../../types.js";
import "./styles.css";

export interface SpinnerProps extends PropsWithSize, PropsWithVariant {}

const Spinner = (props: SpinnerProps) => {
  const { size = "md", variant = "primary" } = props;
  return (
    <div
      className={`k-spinner k-spinner-${size} k-spinner-${variant}`}
      role="status"
      aria-live="polite"
      aria-label="Loading..."
    >
      {/* Visually hidden text using the .k-sr-only class */}
      <span className="k-sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
