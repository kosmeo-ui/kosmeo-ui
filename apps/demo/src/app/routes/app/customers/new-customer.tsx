import { CreateCustomerForm } from "@/features/customers/components/create-customer-form";
import { Page, SectionHeader } from "@kosmeo-ui/react";

const NewCustomerRoute = () => (
  <Page padded gap="md" maxWidth="narrow">
    <SectionHeader
      as="h1"
      title="New customer"
      subtitle="Four short steps. Required fields are marked."
    />
    <CreateCustomerForm />
  </Page>
);

export default NewCustomerRoute;
