import { faEnvelope, faEye } from "@fortawesome/free-solid-svg-icons";
import { PLAN_LABELS, STATUS_VARIANTS } from "../utils/labels";
import { currency, formatDate } from "@/utils/format";
import type { Customer } from "@/types/api";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";
import { useMemo } from "react";
import {
  Badge,
  IconButton,
  RowActions,
  Tooltip,
  type TableColumn,
} from "@kosmeo-ui/react";

/** The customer table's columns, shared by the scrolling and paged views. */
export const useCustomerColumns = (): TableColumn<Customer>[] => {
  const navigate = useNavigate();

  return useMemo(
    () => [
      { title: "Name", dataKey: "name", minWidth: "10rem" },
      { title: "Company", dataKey: "company", minWidth: "10rem" },
      {
        title: "Plan",
        width: "7rem",
        cellElement: (c) => PLAN_LABELS[c.plan],
      },
      {
        title: "Status",
        width: "7rem",
        align: "center",
        cellElement: (c) => (
          <Badge size="sm" variant={STATUS_VARIANTS[c.status]} subtle>
            {c.status}
          </Badge>
        ),
      },
      { title: "Seats", dataKey: "seats", width: "5rem", align: "right" },
      {
        title: "MRR",
        width: "7rem",
        align: "right",
        cellElement: (c) => currency(c.mrr),
      },
      {
        title: "Signed up",
        width: "8rem",
        cellElement: (c) => formatDate(c.signedUp),
      },
      {
        title: "Actions",
        width: "8rem",
        disableRowClick: true,
        cellElement: (c) => (
          <RowActions align="end" gap="xs">
            <Tooltip content={`Email ${c.email}`}>
              <IconButton
                icon={faEnvelope}
                size="sm"
                variant="light"
                aria-label="Email"
                onClick={() => toast.info(`Pretend we emailed ${c.email}`)}
              />
            </Tooltip>
            <Tooltip content="View">
              <IconButton
                icon={faEye}
                size="sm"
                variant="light"
                aria-label="View"
                onClick={() => navigate(paths.app.customer.getHref(c.id))}
              />
            </Tooltip>
          </RowActions>
        ),
      },
    ],
    [navigate]
  );
};
