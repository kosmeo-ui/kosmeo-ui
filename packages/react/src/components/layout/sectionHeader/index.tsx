"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface SectionHeaderProps {
  title: ReactNode;
  /** Small text shown below the title. */
  subtitle?: ReactNode;
  /** Pill/badge row shown beside the title (status pills, tags). */
  badges?: ReactNode;
  /** Small text/breadcrumb row shown above the title. */
  preface?: ReactNode;
  /** Center-aligned content between the title and actions. */
  center?: ReactNode;
  /** Right-side actions (buttons, dropdowns). */
  actions?: ReactNode;
  /** Optional element rendered before the title (icon, badge, avatar). */
  leading?: ReactNode;
  /** Heading level. Defaults to `h3`. `h1` adds a bottom divider by default. */
  as?: "h1" | "h2" | "h3" | "h4";
  /** Reduce vertical spacing. */
  dense?: boolean;
  /** Show bottom divider + extra margin. Defaults to `true` when `as="h1"`. */
  divider?: boolean;
}

const SectionHeader = ({
  title,
  subtitle,
  badges,
  preface,
  center,
  actions,
  leading,
  as: Tag = "h3",
  dense,
  divider,
}: SectionHeaderProps) => {
  const showDivider = divider ?? Tag === "h1";
  const classes = [
    "k-section-header",
    `k-section-header-${Tag}`,
    dense && "k-section-header-dense",
    showDivider && "k-section-header-divider",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      {preface && <div className="k-section-header-preface">{preface}</div>}
      <div
        className={
          center
            ? "k-section-header-row k-section-header-row-with-center"
            : "k-section-header-row"
        }
      >
        <div className="k-section-header-left">
          {leading && <div className="k-section-header-leading">{leading}</div>}
          <div className="k-section-header-titles">
            <Tag className="k-section-header-title">{title}</Tag>
            {subtitle && (
              <div className="k-section-header-subtitle">{subtitle}</div>
            )}
            {badges && <div className="k-section-header-badges">{badges}</div>}
          </div>
        </div>
        {center && <div className="k-section-header-center">{center}</div>}
        {actions && <div className="k-section-header-actions">{actions}</div>}
      </div>
    </header>
  );
};

export default SectionHeader;
