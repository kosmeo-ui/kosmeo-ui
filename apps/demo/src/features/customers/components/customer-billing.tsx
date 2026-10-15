import { PLAN_LABELS } from "../utils/labels";
import type { Customer } from "@/types/api";
import { currency } from "@/utils/format";
import { toast } from "react-toastify";
import {
  Badge,
  BorderedSection,
  Button,
  InfoRow,
  ListCard,
  ListRow,
  Page,
} from "@kosmeo-ui/react";

const INVOICES = [
  { id: "INV-2041", month: "Sep 2026", paid: true },
  { id: "INV-1987", month: "Aug 2026", paid: true },
  { id: "INV-1932", month: "Jul 2026", paid: false },
];

export const CustomerBilling = ({ customer }: { customer: Customer }) => (
  <Page gap="md" maxWidth="none">
    <ListCard
      listTitle="Subscription"
      items={[
        { label: "Plan", value: PLAN_LABELS[customer.plan] },
        { label: "Seats", value: customer.seats },
        { label: "Monthly total", value: currency(customer.mrr) },
        { label: "Renews", value: "Nov 1, 2026" },
      ]}
      footerButtons={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => toast("Plan editor coming soon")}
        >
          Change plan
        </Button>
      }
    />
    <BorderedSection as="h2" title="Invoices" gap="sm">
      {INVOICES.map((inv) => (
        <ListRow
          key={inv.id}
          actions={
            <Badge size="sm" variant={inv.paid ? "success" : "danger"} subtle>
              {inv.paid ? "Paid" : "Overdue"}
            </Badge>
          }
        >
          <InfoRow label={inv.id} value={inv.month} />
        </ListRow>
      ))}
    </BorderedSection>
  </Page>
);
