import { currency, formatDate } from "@/utils/format";
import { PLAN_LABELS } from "../utils/labels";
import type { Customer } from "@/types/api";
import { toast } from "react-toastify";
import {
  AddressBlock,
  BorderedSection,
  Button,
  DetailField,
  FormGrid,
  Page,
  Stepper,
  TagCard,
  type StepperStep,
} from "@kosmeo-ui/react";

const lifecycle = (customer: Customer): StepperStep[] => {
  const order = ["trial", "active", "churned"] as const;
  const at = order.indexOf(customer.status);
  return [
    { key: "signup", label: "Signed up", status: "complete" },
    { key: "trial", label: "Trial", status: at > 0 ? "complete" : "active" },
    {
      key: "active",
      label: "Paying",
      status: at === 1 ? "active" : at > 1 ? "complete" : "pending",
    },
    {
      key: "churned",
      label: "Churned",
      status: at === 2 ? "error" : "pending",
    },
  ];
};

export const CustomerOverview = ({ customer }: { customer: Customer }) => (
  <Page gap="md" maxWidth="none">
    <BorderedSection as="h2" title="Lifecycle">
      <Stepper steps={lifecycle(customer)} />
    </BorderedSection>

    <BorderedSection as="h2" title="Account">
      <FormGrid columns={3}>
        <DetailField label="Customer ID" value={<code>{customer.id}</code>} />
        <DetailField label="Plan" value={PLAN_LABELS[customer.plan]} />
        <DetailField label="Seats" value={customer.seats} />
        <DetailField label="MRR" value={currency(customer.mrr)} />
        <DetailField label="Signed up" value={formatDate(customer.signedUp)} />
        <DetailField
          label="Email"
          value={customer.email}
          action={
            <Button
              size="sm"
              variant="link"
              onClick={() => {
                navigator.clipboard?.writeText(customer.email);
                toast.info("Email copied");
              }}
            >
              Copy
            </Button>
          }
        />
      </FormGrid>
    </BorderedSection>

    <BorderedSection as="h2" title="Address" layout="row">
      <AddressBlock
        label="Billing address"
        address={{
          name: customer.name,
          company: customer.company,
          street1: customer.street1,
          city: customer.city,
          stateProvince: customer.stateProvince,
          postalCode: customer.postalCode,
          countryCode: customer.countryCode,
          phone: customer.phone,
          email: customer.email,
        }}
      />
      <TagCard title="Tags" tags={customer.tags} emptyText="No tags yet" />
    </BorderedSection>
  </Page>
);
