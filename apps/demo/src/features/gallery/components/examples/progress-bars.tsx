import { Button, Col, ProgressBar, Row } from "@kosmeo-ui/react";
import { useState } from "react";

export const ProgressBars = () => {
  const [progress, setProgress] = useState(40);

  return (
    <Col size="md">
      <ProgressBar progress={progress} showPercentage />
      <Row size="sm">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setProgress((p) => Math.max(0, p - 10))}
        >
          −10
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setProgress((p) => Math.min(100, p + 10))}
        >
          +10
        </Button>
      </Row>
      <ProgressBar progress={100} variant="success" showPercentage />
      <ProgressBar progress={85} variant="warning" showPercentage />
      <ProgressBar progress={20} variant="danger" />
    </Col>
  );
};
