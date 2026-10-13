import ConfirmationModal from "../../../overlays/confirmationModal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../../buttons/iconButton";
import { TableRow } from "../types";
import { useState } from "react";

interface DeleteButtonProps<TData> {
  rows: TableRow<TData>[];
  selectedRows: Set<number>;
  allSelected: boolean;
  onDelete?: (rows: TableRow<TData>[]) => void;
}

const DeleteButton = <TData extends object>(
  props: DeleteButtonProps<TData>
) => {
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleShowBulkDeleteModal = () => {
    if (props.selectedRows.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleHideBulkDeleteModal = () => {
    setShowBulkDeleteModal(false);
  };

  const handleDelete = () => {
    if (!props.onDelete) return;
    const res = props.rows.filter((r) => props.selectedRows.has(r.index));
    props.onDelete(res);
    setShowBulkDeleteModal(false);
  };
  if (!props.onDelete) return null;
  return (
    <>
      <IconButton
        size="sm"
        variant="danger"
        onClick={handleShowBulkDeleteModal}
        disabled={!props.selectedRows.size && !props.allSelected}
        icon={faTrash}
      />
      <ConfirmationModal
        show={showBulkDeleteModal}
        title="Delete Data"
        body={`Are you sure you want to delete the selected rows?`}
        handleHide={handleHideBulkDeleteModal}
        handleConfirm={handleDelete}
        confirmButtonText="Delete"
      />
    </>
  );
};

export default DeleteButton;
