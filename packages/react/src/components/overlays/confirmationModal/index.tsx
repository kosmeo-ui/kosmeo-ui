import Button from "../../buttons/button";
import Modal from "../modal";

export interface ConfirmationModalProps {
  show: boolean;
  handleHide: () => void;
  handleConfirm: () => void;
  title: string;
  body: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  return (
    <Modal
      show={props.show}
      title={props.title}
      onClose={props.handleHide}
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
          disabled={props.isLoading}
        >
          {props.confirmButtonText}
        </Button>,
      ]}
    >
      {props.body}
    </Modal>
  );
};

export default ConfirmationModal;
