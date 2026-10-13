"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize, PropsWithVariant } from "../../types.js";
import Button from "../../buttons/button/index.js";
import "./styles.css";
import {
  faCircleCheck,
  faCircleInfo,
  faHand,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export interface AlertProps extends PropsWithSize, PropsWithVariant {
  /** The child element(s) that will appear in the Alert */
  children: React.ReactNode;
  /** **_Optional_** bold heading rendered above the children. */
  heading?: React.ReactNode;
  /** **_Optional_** prop for whether to allow the alert to be dismissed by the user */
  dismissible?: boolean;
  /** **_Optional_** function that is called when the dismiss button is pressed on the Alert */
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
  /** **_Optional_** button text to display */
  buttonText?: string;
}

const Alert = (props: AlertProps) => {
  const { size = "md", variant = "primary" } = props;
  const icon = {
    primary: faCircleInfo,
    secondary: faCircleInfo,
    light: faCircleInfo,
    warning: faTriangleExclamation,
    danger: faHand,
    success: faCircleCheck,
    custom: faCircleInfo,
    link: faCircleInfo,
  };

  return (
    <div className={`k-alert k-alert-${variant} k-alert-${size}`} role="alert">
      <div className="k-alert-content">
        <div className="k-alert-icon-message">
          <FontAwesomeIcon size={"lg"} icon={icon[variant]} />
          <div className="k-alert-body">
            {props.heading && (
              <div className="k-alert-heading">{props.heading}</div>
            )}
            <div className="k-alert-message">{props.children}</div>
          </div>
        </div>
        {props.dismissible && (
          <Button
            size="sm"
            variant={variant}
            onClick={(e) => {
              if (!props.onDismiss) return;
              props.onDismiss(e);
            }}
          >
            {props.buttonText ? props.buttonText : "Acknowledge"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Alert;
