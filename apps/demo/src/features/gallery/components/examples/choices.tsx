import { useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  FormGrid,
  RadioGroup,
  Row,
  Switch,
} from "@kosmeo-ui/react";

export const Choices = () => {
  const [agreed, setAgreed] = useState(false);
  const [days, setDays] = useState(["mon", "wed"]);
  const [size, setSize] = useState<string | null>("md");
  const [enabled, setEnabled] = useState(true);
  const [compact, setCompact] = useState(false);

  return (
    <FormGrid columns={2}>
      <Checkbox
        label="I agree to the terms"
        labelLocation="right"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
      />
      <Checkbox label="Read-only" labelLocation="right" checked readOnly />
      <CheckboxGroup
        label="CheckboxGroup"
        name="days"
        values={days}
        onChange={setDays}
        options={[
          { value: "mon", label: "Monday" },
          { value: "tue", label: "Tuesday" },
          { value: "wed", label: "Wednesday" },
        ]}
      />
      <RadioGroup
        label="RadioGroup"
        name="size"
        value={size}
        onChange={setSize}
        options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ]}
      />
      <Row size="lg" wrap>
        <Switch
          label="Switch"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <Switch
          label="Small, label left"
          size="sm"
          labelLocation="left"
          checked={compact}
          onChange={(e) => setCompact(e.target.checked)}
        />
        <Switch label="Saving" checked isLoading onChange={() => {}} />
      </Row>
    </FormGrid>
  );
};
