import { Alert, Button, Page } from "@kosmeo-ui/react";

export const MainErrorFallback = () => (
  <Page padded maxWidth="narrow">
    <Alert variant="danger" heading="Something went wrong">
      <p>An unexpected error stopped this page from rendering.</p>
      <Button
        variant="danger"
        size="sm"
        onClick={() => window.location.assign(window.location.origin)}
      >
        Reload the app
      </Button>
    </Alert>
  </Page>
);
