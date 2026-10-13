"use client";

import "./styles.css";

export interface ColorSwatchProps {
  color: string;
  size?: "sm" | "md" | "lg";
  /** Border around swatch. Defaults to true. */
  bordered?: boolean;
  /** Accessible label (rendered as title attribute). */
  title?: string;
}

const ColorSwatch = ({
  color,
  size = "md",
  bordered = true,
  title,
}: ColorSwatchProps) => {
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      style={{ backgroundColor: color }}
      className={`k-color-swatch k-color-swatch-${size} ${
        bordered ? "k-color-swatch-bordered" : ""
      }`.trim()}
    />
  );
};

export default ColorSwatch;
