import { Breadcrumbs, Stepper, type StepperStep } from "@kosmeo-ui/react";
import { toast } from "react-toastify";
import { useState } from "react";

const LABELS = ["Account", "Profile", "Plan", "Review"];

export const BreadcrumbsAndStepper = () => {
  const [current, setCurrent] = useState(2);

  const steps: StepperStep[] = LABELS.map((label, i) => ({
    key: label.toLowerCase(),
    label,
    status: i < current ? "complete" : i === current ? "active" : "pending",
    clickable: i < current,
  }));

  return (
    <>
      <Breadcrumbs
        items={[
          {
            label: "Workspace",
            path: "#",
            onClick: (e) => {
              e.preventDefault();
              toast("Breadcrumb clicked");
            },
          },
          { label: "Projects", path: "#" },
          { label: "Website redesign", path: "#" },
        ]}
      />
      <Stepper steps={steps} onStepClick={(_, index) => setCurrent(index)} />
      <Stepper
        orientation="vertical"
        steps={[
          { key: "build", label: "Build", status: "complete" },
          { key: "test", label: "Test", status: "error" },
          { key: "deploy", label: "Deploy", status: "pending" },
        ]}
      />
    </>
  );
};
