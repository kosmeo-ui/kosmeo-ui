"use client";

import { PropsWithSize, PropsWithVariant } from "../../types.js";
import "./styles.css";

interface TabButtonProps extends PropsWithSize, PropsWithVariant {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const TabButton = ({
  active = false,
  onClick,
  children,
  disabled = false,
  size = "md",
  variant = "primary",
}: TabButtonProps) => {
  const buttonClasses = [
    "k-tab-button",
    `k-tab-button-${size}`,
    `k-tab-button-${variant}`,
    active && "k-tab-button-active",
    disabled && "k-tab-button-disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default TabButton;
