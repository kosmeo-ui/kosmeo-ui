import { MouseEventHandler, ReactNode } from "react";
import ProgressBar from "../../feedback/progressBar";
import { PropsWithVariant } from "../../types";
import "./styles.css";

export interface CardHeader {
  title: ReactNode;
  actions?: ReactNode;
}

export interface CardProgress {
  current: number;
  total: number;
  label?: ReactNode;
}

export interface CardProps extends PropsWithVariant {
  children: ReactNode;
  hoverable?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  padding?: "none" | "small" | "default" | "large";
  /** Optional header bar. Title left, actions right. Accepts a `{ title, actions }` object or any ReactNode. */
  header?: CardHeader | ReactNode;
  /** Optional progress bar rendered below the header. */
  progress?: CardProgress;
  /** Optional footer slot rendered below the body (e.g. action buttons). */
  footer?: ReactNode;
  /** Body text alignment. Defaults to "left". */
  align?: "left" | "center";
}

const isStructuredHeader = (header: unknown): header is CardHeader =>
  typeof header === "object" &&
  header !== null &&
  "title" in (header as Record<string, unknown>);

const Card = (props: CardProps) => {
  const {
    hoverable = false,
    padding = "default",
    variant = "primary",
    align = "left",
    header,
    progress,
    footer,
  } = props;
  const cardClasses = [
    "k-card",
    hoverable ? "k-card-hoverable" : "",
    `k-card-padding-${padding}`,
    `k-card-${variant}`,
    `k-card-align-${align}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={props.onClick}>
      {(header !== undefined || progress) && (
        <div className="k-card-header">
          {header !== undefined &&
            (isStructuredHeader(header) ? (
              <div className="k-card-header-row">
                <div className="k-card-header-title">{header.title}</div>
                {header.actions && (
                  <div className="k-card-header-actions">{header.actions}</div>
                )}
              </div>
            ) : (
              <div className="k-card-header-row">{header}</div>
            ))}
          {progress && (
            <div className="k-card-progress">
              {progress.label && (
                <div className="k-card-progress-label">{progress.label}</div>
              )}
              <ProgressBar
                progress={
                  progress.total > 0
                    ? Math.round((progress.current / progress.total) * 100)
                    : 0
                }
              />
            </div>
          )}
        </div>
      )}
      <div className="k-card-body">{props.children}</div>
      {footer && <div className="k-card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
