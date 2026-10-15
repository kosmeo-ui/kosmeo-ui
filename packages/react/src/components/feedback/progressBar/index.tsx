"use client";

import { PropsWithVariant } from "../../types.js";
import "./styles.css";

export interface ProgressBarProps extends PropsWithVariant {
  /** The current progress value, a number between 0 and 100 */
  progress: number;
  /** **_Optional_** prop for whether to show the percent value on the bar */
  showPercentage?: boolean;
}

const ProgressBar = (props: ProgressBarProps) => {
  const { showPercentage = true, variant = "primary" } = props;
  const clampedProgress = Math.max(0, Math.min(100, props.progress));

  const fillBorderRadius =
    clampedProgress === 100 ? "0.25rem" : "0.25rem 0 0 0.25rem";

  // The percentage sits beside the bar, not on the fill: no single text color
  // reaches 4.5:1 on every variant's fill in both themes.
  return (
    <div className="k-progress-bar">
      <div className="k-progress-bar-container">
        <div
          className={`k-progress-bar-fill k-progress-bar-fill-${variant}`}
          style={{
            width: `${clampedProgress}%`,
            borderRadius: fillBorderRadius,
          }}
        />
      </div>
      {showPercentage && (
        <span className="k-progress-bar-text">{clampedProgress}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
