import { Badge, Button, Portal } from "@kosmeo-ui/react";
import { useState } from "react";

// Portal renders its children into document.body, outside any clipping or
// stacking context. Modal, Tooltip and the dropdown lists are built on it.
export const PortalExample = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setShow((s) => !s)}>
        {show ? "Remove" : "Render"} a badge into document.body
      </Button>
      {show && (
        <Portal>
          <div className="demo-portal-badge">
            <Badge variant="primary" size="lg">
              I'm rendered in a portal
            </Badge>
          </div>
        </Portal>
      )}
    </>
  );
};
