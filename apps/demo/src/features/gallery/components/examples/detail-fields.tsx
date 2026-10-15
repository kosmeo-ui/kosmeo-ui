import { Button, DetailField, FormGrid } from "@kosmeo-ui/react";

// DetailField: read-only label/value pairs, laid out in a FormGrid.
export const DetailFields = () => (
  <FormGrid columns={3} gap="lg">
    <DetailField label="Customer" value="Ada Lovelace" />
    <DetailField label="Company" value="Northwind Labs" />
    <DetailField label="Plan" value="Growth" />
    <DetailField label="Seats" value={12} />
    <DetailField label="Signed up" value="Mar 4, 2025" />
    <DetailField
      label="Email"
      value="ada@northwind.example"
      action={
        <Button size="sm" variant="link">
          Copy
        </Button>
      }
    />
  </FormGrid>
);
