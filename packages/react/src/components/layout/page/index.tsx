import Spinner from "../../feedback/spinner";
import Centered from "../centered";
import { ReactNode } from "react";
import "./styles.css";

export type PageGap = "none" | "sm" | "md";
export type PageMaxWidth = "none" | "narrow" | "default" | "wide";

export interface PageProps {
  children?: ReactNode;
  /** Fill parent height (`height: 100%`). Use for list pages with internal scroll regions. */
  fillHeight?: boolean;
  /** Apply 1.5rem padding (1rem on small screens). */
  padded?: boolean;
  /** Vertical gap between direct children. */
  gap?: PageGap;
  /** Centered max-width constraint. */
  maxWidth?: PageMaxWidth;
  /** Loading state. Renders centered spinner when true. */
  loading?: boolean;
}

const Page = ({
  children,
  fillHeight,
  padded,
  gap = "none",
  maxWidth = "default",
  loading,
}: PageProps) => {
  const classes = [
    "k-page",
    fillHeight && "k-page-fill",
    padded && "k-page-padded",
    gap !== "none" && `k-page-gap-${gap}`,
    maxWidth !== "none" && `k-page-max-${maxWidth}`,
  ]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className={`${classes} k-page-loading`}>
        <Centered>
          <Spinner />
        </Centered>
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
};

export default Page;
