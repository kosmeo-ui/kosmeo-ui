import { Card, Col, ProgressBar, SectionHeader } from "@kosmeo-ui/react";

const ONBOARDING = [
  { title: "Import customer list", current: 3, total: 3 },
  { title: "Connect billing provider", current: 2, total: 4 },
  { title: "Invite your team", current: 1, total: 5 },
];

export const WorkspaceSetup = () => (
  <>
    <SectionHeader title="Workspace setup" as="h2" />
    <div className="demo-card-grid">
      {ONBOARDING.map((step) => (
        <Card
          key={step.title}
          header={{ title: step.title }}
          progress={{
            current: step.current,
            total: step.total,
            label: `${step.current} of ${step.total} tasks`,
          }}
        >
          {step.current === step.total
            ? "All done. Nice work."
            : "A few tasks left to finish."}
        </Card>
      ))}
    </div>

    <Card header={{ title: "Seat usage" }}>
      <Col size="md">
        <ProgressBar progress={72} showPercentage />
        <ProgressBar progress={91} variant="warning" showPercentage />
        <ProgressBar progress={34} variant="success" showPercentage />
      </Col>
    </Card>
  </>
);
