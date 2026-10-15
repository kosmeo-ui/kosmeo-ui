import { Button, EmptyState, Page } from "@kosmeo-ui/react";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";

const NotFoundRoute = () => {
  const navigate = useNavigate();

  return (
    <Page padded maxWidth="narrow">
      <EmptyState
        layout="block"
        action={
          <Button onClick={() => navigate(paths.app.dashboard.getHref())}>
            Go to the dashboard
          </Button>
        }
      >
        <h1>Page not found</h1>
        <p>There's nothing at this address.</p>
      </EmptyState>
    </Page>
  );
};

export default NotFoundRoute;
