import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";
import "./styles.css";

export type StepperStatus = "pending" | "active" | "complete" | "error";

export interface StepperStep {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  status: StepperStatus;
  /** When false, this step ignores `onStepClick`. Defaults to true if `onStepClick` is provided. */
  clickable?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Orientation. Defaults to horizontal. */
  orientation?: "horizontal" | "vertical";
  /** Optional handler invoked when a step is clicked. Provides the step `key` and its index. */
  onStepClick?: (key: string, index: number) => void;
}

const defaultIconForStatus = (status: StepperStatus, index: number) => {
  if (status === "complete") return <FontAwesomeIcon icon={faCheck} />;
  if (status === "error") return <FontAwesomeIcon icon={faXmark} />;
  return <span>{index + 1}</span>;
};

const Stepper = ({
  steps,
  orientation = "horizontal",
  onStepClick,
}: StepperProps) => {
  return (
    <ol className={`k-stepper k-stepper-${orientation}`} aria-label="Progress">
      {steps.map((step, i) => {
        const isClickable =
          !!onStepClick &&
          (step.clickable ?? true) &&
          step.status !== "pending";
        const handleClick = isClickable
          ? () => onStepClick(step.key, i)
          : undefined;
        return (
          <li
            key={step.key}
            className={`k-stepper-step k-stepper-step-${step.status}${
              isClickable ? " k-stepper-step-clickable" : ""
            }`}
            aria-current={step.status === "active" ? "step" : undefined}
            onClick={handleClick}
          >
            <div className="k-stepper-marker">
              {step.icon ?? defaultIconForStatus(step.status, i)}
            </div>
            <div className="k-stepper-label">{step.label}</div>
            {i < steps.length - 1 && (
              <div className="k-stepper-connector" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
