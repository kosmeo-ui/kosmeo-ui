import { faEnvelope, faEye } from "@fortawesome/free-solid-svg-icons";
import { PLAN_LABELS, STATUS_VARIANTS } from "../utils/labels";
import { currency, formatDate } from "@/utils/format";
import { Link, useNavigate } from "react-router";
import type { Customer } from "@/types/api";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";
import { useMemo } from "react";
import {
  Badge,
  IconButton,
  RowActions,
  TableCellLink,
  Tooltip,
  type TableColumn,
} from "@kosmeo-ui/react";

/** The customer table's columns, shared by the scrolling and paged views. */
export const useCustomerColumns = (): TableColumn<Customer>[] => {
  const navigate = useNavigate();

  return useMemo(
    () => [
      {
        title: "Name",
        minWidth: "10rem",
        // Row click is mouse-only; the link makes each customer reachable by
        // keyboard, and opens in a new tab on a middle click.
        cellElement: (c) => (
          <TableCellLink as={Link} to={paths.app.customer.getHref(c.id)}>
            {c.name}
          </TableCellLink>
        ),
      },
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
