"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize, PropsWithVariant } from "../../types.js";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getContrastTextColor } from "./utils.js";
import "./styles.css";

export interface BadgeProps extends PropsWithSize, PropsWithVariant {
  /** The content to display inside the badge */
  children: React.ReactNode;
  /** Whether to use pill-shaped (fully rounded) styling. Defaults to true */
  pill?: boolean;
  /** Whether to use subtle styling with transparent background. Defaults to false */
  subtle?: boolean;
  /** Custom hex color. Required when variant="custom". Sets background and auto-picks contrast text color. */
  color?: string;
  /** When present, renders an inline × button. Caller handles state mutation. */
  onRemove?: () => void;
  /** Optional icon rendered before children. */
  startIcon?: React.ReactNode;
  /** When set, renders the badge as a button. */
  onClick?: () => void;
  /** Accessible label used when onClick is set. */
  ariaLabel?: string;
}

const Badge = ({
  children,
  size = "md",
  variant = "primary",
  pill = true,
  subtle = false,
  color,
  onRemove,
  startIcon,
  onClick,
  ariaLabel,
}: BadgeProps) => {
  if (variant === "custom" && !color) {
    throw new Error(
      'Badge: variant="custom" requires a `color` prop (hex string).'
    );
  }

  const pillClass = pill ? "k-badge-pill" : "";
  const subtleClass = subtle ? "k-badge-subtle" : "";
  const clickableClass = onClick ? "k-badge-clickable" : "";
  const classes =
    `k-badge k-badge-${variant} k-badge-${size} ${pillClass} ${subtleClass} ${clickableClass}`.trim();

  const inlineStyle =
    variant === "custom" && color
      ? {
          backgroundColor: color,
          color:
            getContrastTextColor(color) === "light"
              ? "var(--text-color-light)"
              : "var(--text-color)",
        }
      : undefined;

  const label = (
    <>
      {startIcon && <span className="k-badge-start-icon">{startIcon}</span>}
      <span className="k-badge-content">{children}</span>
    </>
  );

  const removeButton = onRemove && (
    <button
      type="button"
      aria-label="Remove"
      className="k-badge-remove"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <FontAwesomeIcon icon={faXmark} />
    </button>
  );

  // Clickable and removable: two sibling buttons in a span, since a button
  // can't contain another.
  if (onClick && onRemove) {
    return (
      <span className={classes} style={inlineStyle}>
        <button
          type="button"
          aria-label={ariaLabel}
          className="k-badge-action"
          onClick={onClick}
        >
          {label}
        </button>
        {removeButton}
      </span>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        className={classes}
        style={inlineStyle}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={classes} style={inlineStyle}>
      {label}
      {removeButton}
    </span>
  );
};

export default Badge;
