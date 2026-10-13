import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize, PropsWithVariant } from "../../types";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { ReactNode, useRef, useState } from "react";
import IconButton from "../../buttons/iconButton";
import Button from "../../buttons/button";
import "./styles.css";
import {
  faCaretDown,
  faCaretUp,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export interface DropdownProps extends PropsWithSize, PropsWithVariant {
  children: ReactNode;
  label?: ReactNode;
  icon?: IconDefinition;
  align?: "left" | "right";
  renderCaret?: boolean;
  /** Controlled mode: whether the dropdown is open */
  isOpen?: boolean;
  /** Controlled mode: callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

const Dropdown = (props: DropdownProps) => {
  const { align = "left", renderCaret = true } = props;

  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = props.isOpen !== undefined;
  const isOpen = isControlled ? props.isOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (isControlled) props.onOpenChange?.(open);
    else setInternalIsOpen(open);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  useOutsideClick([dropdownRef], () => setIsOpen(false));

  const label = (
    <div className="k-dropdown-label-container">
      {props.label}
      {renderCaret && (
        <FontAwesomeIcon icon={isOpen ? faCaretUp : faCaretDown} />
      )}
    </div>
  );

  return (
    <div ref={dropdownRef} className={`k-dropdown-container`}>
      {props.icon ? (
        <IconButton
          size={props.size}
          variant={props.variant}
          icon={props.icon}
          onClick={handleTriggerClick}
        >
          {props.label && label}
        </IconButton>
      ) : (
        <Button
          size={props.size}
          variant={props.variant}
          onClick={handleTriggerClick}
        >
          {props.label && label}
        </Button>
      )}

      <div className={`k-dropdown-menu ${align} ${isOpen ? "open" : ""}`}>
        {props.children}
      </div>
    </div>
  );
};

export default Dropdown;
