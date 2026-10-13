import { ReactNode } from "react";
import "./styles.css";

export interface DetailFieldProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional inline action (edit, copy). */
  action?: ReactNode;
}

const DetailField = ({ label, value, action }: DetailFieldProps) => {
  return (
    <div className="k-detail-field">
      <div className="k-detail-field-label">{label}</div>
      <div className="k-detail-field-value">
        <span>{value}</span>
        {action && <span className="k-detail-field-action">{action}</span>}
      </div>
    </div>
  );
};

export default DetailField;
