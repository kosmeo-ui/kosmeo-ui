"use client";

import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import useFocusTrap from "../../../hooks/useFocusTrap.js";
import Button from "../../buttons/button/index.js";
import Portal from "../portal/index.js";
import "./styles.css";

export type ModalSize = "sm" | "md" | "lg" | "full";

interface ModalProps extends PropsWithChildren {
  /** A function that is called when the modal is closed */
  onClose: () => void;
  /** **_Optional_** title to appear at the top of the Modal */
  title?: React.ReactNode;
  /** **_Optional_** flag for whether or not to show the Modal */
  show?: boolean;
  /** Options buttons to add to the bottom of the modal */
  footerButtons?: React.ReactNode[];
  /**
   * **_Optional_** size variant. `full` renders edge-to-edge at ~90% of the
   * viewport — use for dense content (tables, search results, side-by-side
   * editors) that would feel cramped at `lg`.
   */
  size?: ModalSize;
  /** **_Optional_** whether Escape and a click on the backdrop close the modal. When `false`, only the modal's own buttons can close it. Defaults to `true` */
  dismissible?: boolean;
}

const Modal = (props: ModalProps) => {
  const { size = "md", dismissible = true } = props;
  const [shouldRender, setShouldRender] = useState(props.show);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pressStartedOnOverlay = useRef(false);

  useEffect(() => {
    if (props.show) {
      setIsAnimating(false);
      setShouldRender(true);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [props.show]);

  useEffect(() => {
    if (!props.show || !dismissible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [props.show, props.onClose, dismissible]);

  useFocusTrap(contentRef, !!props.show && !!shouldRender);

  if (!shouldRender) return null;

  return (
    <Portal>
      {/* Close only when the press starts and ends on the backdrop, so a text
          selection dragged out of the dialog doesn't close it. */}
      <div
        className={`k-modal-overlay ${isAnimating ? "closing" : ""}`}
        onMouseDown={(e) => {
          pressStartedOnOverlay.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (
            dismissible &&
            pressStartedOnOverlay.current &&
            e.target === e.currentTarget
          ) {
            props.onClose();
          }
        }}
      >
        <div
          ref={contentRef}
          className={`k-modal-content ${isAnimating ? "closing" : ""} ${size}`}
          role="dialog"
          aria-modal="true"
        >
          {props.title && <div className="k-modal-header">{props.title}</div>}
          <div className="k-modal-body">{props.children}</div>
          <div className="k-modal-footer">
            {props.footerButtons ? (
              props.footerButtons.map((button, index) => (
                <React.Fragment key={index}>{button}</React.Fragment>
              ))
            ) : (
              <Button onClick={props.onClose} variant="secondary">
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
