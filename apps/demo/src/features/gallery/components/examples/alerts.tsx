import { Alert } from "@kosmeo-ui/react";
import { useState } from "react";

export const Alerts = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Alert variant="success" heading="Payment received">
        Invoice INV-2041 was paid in full.
      </Alert>
      <Alert variant="warning">Your trial ends in 3 days.</Alert>
      <Alert variant="danger" size="sm">
        Sync failed. Check the integration settings.
      </Alert>
      {open && (
        <Alert variant="secondary" dismissible onDismiss={() => setOpen(false)}>
          Dismiss me.
        </Alert>
      )}
    </>
  );
};
