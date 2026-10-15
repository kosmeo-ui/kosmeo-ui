import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  LoadingOverlay,
  Row,
  Spinner,
} from "@kosmeo-ui/react";

export const LoadingStates = () => {
  const [overlay, setOverlay] = useState(false);

  const flashOverlay = () => {
    setOverlay(true);
    setTimeout(() => setOverlay(false), 1500);
  };

  return (
    <>
      <Row align="center" size="lg">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner variant="success" />
        <Spinner variant="danger" />
        <Button variant="secondary" onClick={flashOverlay}>
          Show loading overlay
        </Button>
      </Row>
      <Card padding="none">
        <EmptyState
          layout="block"
          icon={<FontAwesomeIcon icon={faFolderOpen} />}
          action={<Button size="sm">Create a project</Button>}
        >
          No projects yet
        </EmptyState>
      </Card>
      <EmptyState>Inline empty state, for inside a list.</EmptyState>
      <LoadingOverlay show={overlay} message="Crunching numbers…" fullPage />
    </>
  );
};
