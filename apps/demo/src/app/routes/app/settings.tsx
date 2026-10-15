import { SecuritySettings } from "@/features/settings/components/security-settings";
import { GeneralSettings } from "@/features/settings/components/general-settings";
import { CustomerPicker } from "@/features/customers/components/customer-picker";
import { Page, SectionHeader, Tabs } from "@kosmeo-ui/react";
import { useState } from "react";

const SettingsRoute = () => {
  const [tab, setTab] = useState("general");

  return (
    <Page padded gap="md" maxWidth="default">
      <SectionHeader
        as="h1"
        title="Settings"
        subtitle="Workspace preferences"
      />
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          {
            key: "general",
            label: "General",
            content: (
              <GeneralSettings
                accountOwnerField={
                  <CustomerPicker label="Default account owner" />
                }
              />
            ),
          },
          {
            key: "security",
            label: "Security",
            content: <SecuritySettings />,
          },
        ]}
      />
    </Page>
  );
};

export default SettingsRoute;
