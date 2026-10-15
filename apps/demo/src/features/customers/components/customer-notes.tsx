import { useState } from "react";
import {
  BorderedSection,
  Button,
  EmptyState,
  ListRow,
  Modal,
  TextArea,
} from "@kosmeo-ui/react";

export const CustomerNotes = ({
  notes,
  onAddClick,
}: {
  notes: string[];
  onAddClick: () => void;
}) => (
  <BorderedSection
    as="h2"
    title="Notes"
    actions={
      <Button size="sm" onClick={onAddClick}>
        Add note
      </Button>
    }
  >
    {notes.length === 0 ? (
      <EmptyState>No notes for this customer yet.</EmptyState>
    ) : (
      notes.map((n, i) => <ListRow key={i}>{n}</ListRow>)
    )}
  </BorderedSection>
);

export const AddNoteModal = ({
  show,
  onClose,
  onSave,
}: {
  show: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
}) => {
  const [note, setNote] = useState("");

  const close = () => {
    setNote("");
    onClose();
  };

  return (
    <Modal
      show={show}
      title="Add a note"
      onClose={close}
      // A stray click or Escape shouldn't throw away the draft.
      dismissible={false}
      footerButtons={[
        <Button key="cancel" variant="secondary" onClick={close}>
          Cancel
        </Button>,
        <Button
          key="save"
          disabled={!note.trim()}
          onClick={() => {
            onSave(note.trim());
            close();
          }}
        >
          Save note
        </Button>,
      ]}
    >
      <TextArea
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What happened on the last call?"
        autoExpand
        showCharCount
        max={500}
      />
    </Modal>
  );
};
