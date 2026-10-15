"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize, PropsWithVariant } from "../../types.js";
import { RefObject } from "react";
import "./styles.css";

export interface ButtonProps extends PropsWithSize, PropsWithVariant {
  /** The child element(s) that will appear in the Button */
  children?: React.ReactNode;
  /** Function that is called when the button is pressed */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Whether or not the button should be active */
  disabled?: boolean;
  /** How to align the content of the button */
  align?: "left" | "center" | "right";
  /** Whether or not to show the shadow around the button */
  shadow?: boolean;
  /** Reference to the button element */
  ref?: RefObject<HTMLButtonElement | null>;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** ID of the form element to associate with (for submit buttons outside the form) */
  form?: string;
  /** Whether the button is in a isLoading state */
  isLoading?: boolean;
  /** Whether the button should take full width. Defaults to false
   * (content-width via `width: fit-content`, which stays content-sized in
   * block, flex-row, AND flex-column containers). Set true for a 100%-width
   * button — e.g. a form's primary submit, or paired action buttons that
   * should split a row evenly. */
  fullWidth?: boolean;
  /** Accessible label. Required for icon-only buttons. */
  "aria-label"?: string;
  /** Marks a toggle button as on or off. */
  "aria-pressed"?: boolean;
  /** ID of element describing this button (for additional context). */
  "aria-describedby"?: string;
  /** ID of element labelling this button. */
  "aria-labelledby"?: string;
  /** HTML title attribute (native tooltip). */
  title?: string;
}

const Button = (props: ButtonProps) => {
  const {
    size = "md",
    variant = "primary",
    align = "center",
    shadow = true,
    type = "button",
    form,
    isLoading = false,
    fullWidth = false,
  } = props;
  return (
    <button
      ref={props.ref}
      type={type}
      form={form}
      disabled={props.disabled || isLoading}
      aria-label={props["aria-label"]}
      aria-describedby={props["aria-describedby"]}
      aria-labelledby={props["aria-labelledby"]}
      aria-busy={isLoading || undefined}
      aria-pressed={props["aria-pressed"]}
      title={props.title}
      className={`k-button k-button-${variant} k-button-${size} k-button-${align} ${
        shadow ? "k-button-shadow" : ""
      } ${`k-button-${fullWidth ? "full" : "auto"}-width`}`.trim()}
      onClick={props.onClick}
    >
      {isLoading ? (
        <>
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="k-button-spinner"
            spin
            aria-hidden="true"
          />
          {/* Keeps the button's accessible name while the spinner shows. */}
          <span className="k-sr-only">{props.children}</span>
        </>
      ) : (
        props.children
      )}
    </button>
  );
};
export default Button;
