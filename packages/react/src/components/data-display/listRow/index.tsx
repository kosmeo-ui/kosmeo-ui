import { ReactNode } from "react";
import "./styles.css";

export interface ListRowProps {
  children: ReactNode;
  /** Right-aligned action cluster (icon buttons, etc.). */
  actions?: ReactNode;
}

const ListRow = ({ children, actions }: ListRowProps) => {
  return (
    <div className="k-list-row">
      <div className="k-list-row-body">{children}</div>
      {actions && <div className="k-list-row-actions">{actions}</div>}
    </div>
  );
};

export default ListRow;
