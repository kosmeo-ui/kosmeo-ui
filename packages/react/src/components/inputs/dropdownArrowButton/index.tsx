"use client";

import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize } from "../../types.js";
import "./styles.css";

interface DropdownArrowButtonProps extends PropsWithSize {
  isOpen: boolean;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (e: React.MouseEvent<any>) => void;
}

const DropdownArrowButton = ({
  size,
  isOpen,
  disabled = false,
  onClick,
}: DropdownArrowButtonProps) => {
  return (
    <button
      type="button"
      className={`k-dropdown-arrow k-dropdown-arrow-${size}`}
      onClick={onClick}
      tabIndex={-1}
      disabled={disabled}
      aria-label={isOpen ? "Hide options" : "Show options"}
    >
      <FontAwesomeIcon
        icon={faChevronDown}
        className={isOpen ? "k-dropdown-arrow-open" : ""}
      />
    </button>
  );
};

export default DropdownArrowButton;
