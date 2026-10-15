import { Row, TabButton } from "@kosmeo-ui/react";
import { useState } from "react";

const PERIODS = ["day", "week", "month", "year"];

export const TabButtons = () => {
  const [period, setPeriod] = useState("week");

  return (
    <Row size="sm">
      {PERIODS.map((p) => (
        <TabButton key={p} active={period === p} onClick={() => setPeriod(p)}>
          {p}
        </TabButton>
      ))}
    </Row>
  );
};
