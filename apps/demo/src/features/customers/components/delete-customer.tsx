import { useDeleteCustomers } from "../api/delete-customers";
import { ConfirmationModal } from "@kosmeo-ui/react";
import type { Customer } from "@/types/api";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";

export const DeleteCustomer = ({
  customer,
  show,
  onClose,
}: {
  customer: Customer;
  show: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const deleteCustomers = useDeleteCustomers({
    mutationConfig: {
      onSuccess: () => {
        toast.success(`Deleted ${customer.name}`);
        navigate(paths.app.customers.getHref());
      },
    },
  });

  return (
    <ConfirmationModal
      show={show}
      title="Delete customer"
      body={`Delete ${customer.name}? This can't be undone.`}
      confirmButtonText="Delete"
      handleHide={onClose}
      handleConfirm={() =>
        deleteCustomers.mutate({ customerIds: [customer.id] })
      }
      isLoading={deleteCustomers.isPending}
    />
  );
};
