"use client";

import Button from "../../buttons/button/index.js";
import Input from "../../inputs/input/index.js";
import Modal from "../modal/index.js";
import { useState } from "react";
import "./styles.css";

export interface ConfirmationModalProps {
  show: boolean;
  handleHide: () => void;
  handleConfirm: () => void;
  title: string;
  body: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  isLoading?: boolean;
  /** **_Optional_** text the user must type, exactly, before the confirm button enables (e.g. the name of what's being deleted) */
  confirmationText?: string;
  /** **_Optional_** whether Escape and a click outside close the modal. Defaults to `true` */
  dismissible?: boolean;
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  const [typed, setTyped] = useState("");
  const [wasShown, setWasShown] = useState(props.show);

  // Clear the typed text each time the modal opens, so a match from a
  // previous confirmation never carries over.
  if (props.show !== wasShown) {
    setWasShown(props.show);
    if (props.show) setTyped("");
  }

  const confirmed =
    props.confirmationText === undefined || typed === props.confirmationText;
  const canConfirm = confirmed && !props.isLoading;

  return (
    <Modal
      show={props.show}
      title={props.title}
      onClose={props.handleHide}
      // Cancel is disabled while loading; Escape and the backdrop follow suit.
      dismissible={props.dismissible !== false && !props.isLoading}
      footerButtons={[
        <Button
          key="cancel"
          variant="secondary"
          onClick={props.handleHide}
          disabled={props.isLoading}
        >
          {props.cancelButtonText || "Cancel"}
        </Button>,
        <Button
          key="confirm"
          variant="danger"
          onClick={props.handleConfirm}
          isLoading={props.isLoading}
          disabled={!canConfirm}
        >
          {props.confirmButtonText}
        </Button>,
      ]}
    >
      {props.body}
      {props.confirmationText !== undefined && (
        <div className="k-confirmation-modal-check">
          <Input
            label={`Type "${props.confirmationText}" to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canConfirm) props.handleConfirm();
            }}
            autoComplete="off"
          />
        </div>
      )}
    </Modal>
  );
};

export default ConfirmationModal;
