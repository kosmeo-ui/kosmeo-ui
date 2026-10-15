import { useState } from "react";
import {
  Alert,
  BorderedSection,
  Page,
  RecoveryCodeGrid,
  SecretDisplay,
  Switch,
} from "@kosmeo-ui/react";

const RECOVERY_CODES = [
  "k7f2-9qxa",
  "m3d8-p1zr",
  "a9vb-4k2e",
  "t6hn-8wq3",
  "c2lp-7xm5",
  "r4ys-0bjd",
  "w8ef-3ug6",
  "n1ka-5tzc",
  "h5qm-2rvo",
  "e0dj-6sny",
];

export const SecuritySettings = () => {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <Page gap="md" maxWidth="none">
      <BorderedSection as="h2" title="API key">
        <SecretDisplay
          value="kdemo_not_a_real_key_7f3a9c2e"
          copyable
          revealable
        />
        <Alert variant="warning" size="sm">
          Anyone with this key can read your customer data. Keep it secret.
        </Alert>
      </BorderedSection>

      <BorderedSection
        as="h2"
        title="Two-factor authentication"
        actions={
          <Switch
            size="sm"
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
          />
        }
      >
        {twoFactor ? (
          <>
            <p>Store these recovery codes somewhere safe. Each works once.</p>
            <RecoveryCodeGrid codes={RECOVERY_CODES} columns={2} numbered />
          </>
        ) : (
          <Alert variant="danger" size="sm">
            Two-factor authentication is off for this workspace.
          </Alert>
        )}
      </BorderedSection>
    </Page>
  );
};
