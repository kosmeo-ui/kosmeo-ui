"use client";

import "./styles.css";

export interface RecoveryCodeGridProps {
  codes: string[];
  /** Number of columns. Defaults to 2. */
  columns?: 1 | 2 | 3;
  /** Show each code with a numeric prefix (1., 2., …). Defaults to false. */
  numbered?: boolean;
}

const RecoveryCodeGrid = ({
  codes,
  columns = 2,
  numbered,
}: RecoveryCodeGridProps) => {
  return (
    <ul className={`k-recovery-code-grid k-recovery-code-grid-${columns}col`}>
      {codes.map((code, i) => (
        <li key={code} className="k-recovery-code-grid-item">
          {numbered && (
            <span className="k-recovery-code-grid-index">{i + 1}.</span>
          )}
          <code className="k-recovery-code-grid-code">{code}</code>
        </li>
      ))}
    </ul>
  );
};

export default RecoveryCodeGrid;
