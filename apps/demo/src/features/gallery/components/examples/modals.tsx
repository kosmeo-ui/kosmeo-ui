import { Button, ConfirmationModal, Modal, Row } from "@kosmeo-ui/react";
import { toast } from "react-toastify";
import { useState } from "react";

type ModalSize = "sm" | "md" | "lg" | "full";

const SIZES: ModalSize[] = ["sm", "md", "lg", "full"];
const PROJECT = "website-redesign";

export const Modals = () => {
  const [size, setSize] = useState<ModalSize | null>(null);
  const [pinned, setPinned] = useState(false);
  const [confirming, setConfirming] = useState<"plain" | "typed" | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setConfirming(null);
      toast.success("Deleted");
    }, 1000);
  };

  return (
    <>
      <Row wrap>
        {SIZES.map((s) => (
          <Button key={s} variant="secondary" onClick={() => setSize(s)}>
            Open {s} modal
          </Button>
        ))}
        <Button variant="secondary" onClick={() => setPinned(true)}>
          Open with dismissible=false
        </Button>
      </Row>
      <Row wrap>
        <Button variant="danger" onClick={() => setConfirming("plain")}>
          Open ConfirmationModal
        </Button>
        <Button variant="danger" onClick={() => setConfirming("typed")}>
          Open with confirmationText
        </Button>
      </Row>
      <Modal
        show={size !== null}
        size={size ?? "md"}
        title={`A ${size} modal`}
        onClose={() => setSize(null)}
        footerButtons={[
          <Button key="close" variant="secondary" onClick={() => setSize(null)}>
            Close
          </Button>,
        ]}
      >
        Focus is trapped inside the modal. Escape or a click on the backdrop
        closes it.
      </Modal>
      <Modal
        show={pinned}
        title="Not dismissible"
        onClose={() => setPinned(false)}
        dismissible={false}
        footerButtons={[
          <Button
            key="close"
            variant="secondary"
            onClick={() => setPinned(false)}
          >
            Close
          </Button>,
        ]}
      >
        Neither Escape nor a click on the backdrop closes this one. Only the
        Close button does.
      </Modal>
      <ConfirmationModal
        show={confirming === "plain"}
        title="Archive project"
        body="Archive this project? You can restore it later."
        confirmButtonText="Archive"
        handleHide={() => setConfirming(null)}
        handleConfirm={confirmDelete}
        isLoading={deleting}
      />
      {/* Delete stays disabled until the user types the project name exactly. */}
      <ConfirmationModal
        show={confirming === "typed"}
        title="Delete project"
        body={`Delete ${PROJECT} and everything in it? This can't be undone.`}
        confirmButtonText="Delete project"
        confirmationText={PROJECT}
        handleHide={() => setConfirming(null)}
        handleConfirm={confirmDelete}
        isLoading={deleting}
      />
    </>
  );
};
