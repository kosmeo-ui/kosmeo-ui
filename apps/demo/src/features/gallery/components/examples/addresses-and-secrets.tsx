import {
  AddressBlock,
  FormGrid,
  RecoveryCodeGrid,
  SecretDisplay,
} from "@kosmeo-ui/react";

const ADDRESS = {
  name: "Ada Lovelace",
  company: "Northwind Labs",
  street1: "221 Market St",
  street2: "Suite 400",
  city: "Portland",
  stateProvince: "OR",
  postalCode: "97205",
  countryCode: "US",
  phone: "+15035551234",
  email: "ada@northwind.example",
};

export const AddressesAndSecrets = () => (
  <>
    <FormGrid columns={2}>
      <AddressBlock label="AddressBlock (full)" address={ADDRESS} />
      <AddressBlock
        label='variant="compact"'
        address={ADDRESS}
        variant="compact"
        hideContact
      />
    </FormGrid>
    <SecretDisplay
      value="kdemo_not_a_real_key_7f3a9c2e"
      copyable
      revealable
    />
    <RecoveryCodeGrid
      codes={[
        "k7f2-9qxa",
        "m3d8-p1zr",
        "a9vb-4k2e",
        "t6hn-8wq3",
        "c2lp-7xm5",
        "r4ys-0bjd",
      ]}
      columns={3}
      numbered
    />
  </>
);
