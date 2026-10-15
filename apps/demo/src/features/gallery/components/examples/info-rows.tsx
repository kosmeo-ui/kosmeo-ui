import { FormGrid, InfoRow } from "@kosmeo-ui/react";

// InfoRow: a compact list of label/value rows, divided by lines. Group the
// rows in one container; the last row drops its divider.
export const InfoRows = () => (
  <FormGrid columns={2} gap="lg">
    <div>
      <h3 className="demo-example-label">layout="horizontal" (default)</h3>
      <InfoRow label="Plan" value="Growth" />
      <InfoRow label="Seats" value={12} />
      <InfoRow label="Monthly total" value="$1,188" />
      <InfoRow label="Renews" value="Nov 1, 2026" />
    </div>
    <div>
      <h3 className="demo-example-label">layout="stacked"</h3>
      <InfoRow
        layout="stacked"
        label="Billing contact"
        value="ada@northwind.example"
      />
      <InfoRow
        layout="stacked"
        label="Address"
        value="221 Market St, Portland, OR 97205"
      />
    </div>
  </FormGrid>
);
