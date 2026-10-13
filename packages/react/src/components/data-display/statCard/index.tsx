"use client";

import Card from "../../layout/card/index.js";
import { ReactNode } from "react";
import "./styles.css";

export type StatCardIconVariant =
  "primary" | "secondary" | "success" | "warning" | "danger";

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional leading icon rendered in a colored tile. */
  icon?: ReactNode;
  /** Background color for the icon tile. Defaults to "primary". */
  iconVariant?: StatCardIconVariant;
  /** Optional element rendered on the right (e.g., chevron). */
  trailing?: ReactNode;
  /** If provided, the card renders as an anchor and uses `href`. */
  href?: string;
  /** Click handler. Card receives hover styling when interactive. */
  onClick?: () => void;
  /** Compact preset: small uppercase label above large value, no icon/trailing. */
  compact?: boolean;
}

const StatCard = ({
  label,
  value,
  icon,
  iconVariant = "primary",
  trailing,
  href,
  onClick,
  compact = false,
}: StatCardProps) => {
  const isInteractive = Boolean(href || onClick);
  const classes = [
    "k-stat-card",
    compact ? "k-stat-card-compact" : "k-stat-card-default",
    isInteractive ? "k-stat-card-interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = compact ? (
    <>
      <div className="k-stat-card-label">{label}</div>
      <div className="k-stat-card-value">{value}</div>
    </>
  ) : (
    <>
      {icon && (
        <div className={`k-stat-card-icon k-stat-card-icon-${iconVariant}`}>
          {icon}
        </div>
      )}
      <div className="k-stat-card-content">
        <div className="k-stat-card-value">{value}</div>
        <div className="k-stat-card-label">{label}</div>
      </div>
      {trailing && <div className="k-stat-card-trailing">{trailing}</div>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        <Card padding={compact ? "small" : "default"} hoverable>
          {body}
        </Card>
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        <Card padding={compact ? "small" : "default"} hoverable>
          {body}
        </Card>
      </button>
    );
  }

  return (
    <div className={classes}>
      <Card padding={compact ? "small" : "default"}>{body}</Card>
    </div>
  );
};

export default StatCard;
