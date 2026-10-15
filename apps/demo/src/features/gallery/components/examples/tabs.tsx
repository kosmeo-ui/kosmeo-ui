import { Tabs } from "@kosmeo-ui/react";
import { useState } from "react";

export const TabsExample = () => {
  const [tab, setTab] = useState("profile");
  const [view, setView] = useState("list");

  return (
    <>
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "profile", label: "Profile", content: <p>Profile panel</p> },
          { key: "billing", label: "Billing", content: <p>Billing panel</p> },
          { key: "audit", label: "Audit log (disabled)", disabled: true },
        ]}
      />
      <Tabs
        stripOnly
        active={view}
        onChange={setView}
        tabs={[
          { key: "list", label: "List" },
          { key: "board", label: "Board" },
        ]}
      />
      <p>stripOnly renders just the tab strip. Current view: {view}</p>
    </>
  );
};
