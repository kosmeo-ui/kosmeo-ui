import MandatoryAsterisk from "../requiredAsterisk";
import { ReactNode } from "react";
import "./styles.css";

interface OptionsGroupProps {
  label?: string;
  required?: boolean;
  children: ReactNode;
}

/** Internal shell for CheckboxGroup / RadioGroup — label + option list. */
const OptionsGroup = ({ label, required, children }: OptionsGroupProps) => (
  <div className="k-options-group">
    {label && (
      <label className="k-options-group-label">
        {label}
        {required && <MandatoryAsterisk />}
      </label>
    )}
    <div className="k-options-group-options">{children}</div>
  </div>
);

export default OptionsGroup;
