import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import useFocusTrap from "../../../hooks/useFocusTrap";
import Button from "../../buttons/button";
import Portal from "../portal";
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
}

const Modal = (props: ModalProps) => {
  const { size = "md" } = props;
  const [shouldRender, setShouldRender] = useState(props.show);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
    if (!props.show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [props.show, props.onClose]);

  useFocusTrap(contentRef, !!props.show && !!shouldRender);

  if (!shouldRender) return null;

  return (
    <Portal>
      <div className={`k-modal-overlay ${isAnimating ? "closing" : ""}`}>
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
