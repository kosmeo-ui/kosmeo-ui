import { Alert } from "@kosmeo-ui/react";
import { useState } from "react";

export const WelcomeBanner = () => {
  const [show, setShow] = useState(true);
  if (!show) return null;

  return (
    <Alert
      variant="primary"
      heading="Welcome to the Kosmeo UI demo"
      dismissible
      onDismiss={() => setShow(false)}
    >
      Everything here is built from <code>@kosmeo-ui/react</code>. Data comes
      from a mock API (MSW) in the browser, so feel free to add and delete
      customers.
    </Alert>
  );
};
