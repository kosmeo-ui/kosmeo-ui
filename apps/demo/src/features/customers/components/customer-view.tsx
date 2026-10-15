import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { AddNoteModal, CustomerNotes } from "./customer-notes";
import { PLAN_LABELS, STATUS_VARIANTS } from "../utils/labels";
import { CustomerOverview } from "./customer-overview";
import { CustomerBilling } from "./customer-billing";
import { DeleteCustomer } from "./delete-customer";
import { useCustomer } from "../api/get-customer";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";
import { useState } from "react";
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Dropdown,
  Page,
  SectionHeader,
  Tabs,
} from "@kosmeo-ui/react";

export const CustomerView = ({ customerId }: { customerId: string }) => {
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer({ customerId });
  const [tab, setTab] = useState("overview");
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

  if (isLoading) return <Page padded loading />;

  if (!customer) {
    return (
      <Page padded maxWidth="narrow">
        <Alert variant="danger" heading="Customer not found">
          It may have been deleted.{" "}
          <Button
            variant="link"
            onClick={() => navigate(paths.app.customers.getHref())}
          >
            Back to customers
          </Button>
        </Alert>
      </Page>
    );
  }

  return (
    <Page padded gap="md" maxWidth="wide">
      <Breadcrumbs
        items={[
          {
            label: "Customers",
            path: paths.app.customers.getHref(),
            onClick: (e) => {
              e.preventDefault();
              navigate(paths.app.customers.getHref());
            },
          },
          {
            label: customer.name,
            path: paths.app.customer.getHref(customer.id),
          },
        ]}
      />
      <SectionHeader
        as="h1"
        preface={customer.company}
        title={customer.name}
        badges={
          <>
            <Badge variant={STATUS_VARIANTS[customer.status]}>
              {customer.status}
            </Badge>
            <Badge variant="primary" subtle>
              {PLAN_LABELS[customer.plan]}
            </Badge>
          </>
        }
        actions={
          <Dropdown
            icon={faEllipsisVertical}
            aria-label="Customer actions"
            variant="light"
            align="right"
            renderCaret={false}
          >
            <div className="demo-menu">
              <Button
                variant="light"
                fullWidth
                align="left"
                onClick={() => setAddingNote(true)}
              >
                Add note
              </Button>
              <Button
                variant="light"
                fullWidth
                align="left"
                onClick={() => toast("Invite sent")}
              >
                Resend invite
              </Button>
              <Button
                variant="danger"
                fullWidth
                align="left"
                onClick={() => setDeleting(true)}
              >
                Delete customer
              </Button>
            </div>
          </Dropdown>
        }
        divider
      />

      {customer.status === "churned" && (
        <Alert variant="warning" heading="This customer has churned">
          Their subscription ended. Reach out before archiving the account.
        </Alert>
      )}

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          {
            key: "overview",
            label: "Overview",
            content: <CustomerOverview customer={customer} />,
          },
          {
            key: "billing",
            label: "Billing",
            content: <CustomerBilling customer={customer} />,
          },
          {
            key: "notes",
            label: `Notes (${notes.length})`,
            content: (
              <CustomerNotes
                notes={notes}
                onAddClick={() => setAddingNote(true)}
              />
            ),
          },
          { key: "audit", label: "Audit log", disabled: true },
        ]}
      />

      <AddNoteModal
        show={addingNote}
        onClose={() => setAddingNote(false)}
        onSave={(note) => setNotes((n) => [note, ...n])}
      />
      <DeleteCustomer
        customer={customer}
        show={deleting}
        onClose={() => setDeleting(false)}
      />
    </Page>
  );
};
