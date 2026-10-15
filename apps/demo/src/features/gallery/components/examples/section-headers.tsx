import {
  Badge,
  BorderedSection,
  Button,
  SectionHeader,
} from "@kosmeo-ui/react";

export const SectionHeaders = () => (
  <>
    <SectionHeader
      as="h2"
      preface="Northwind Labs"
      title="Ada Lovelace"
      subtitle="Customer since March 2025"
      badges={<Badge variant="success">active</Badge>}
      actions={<Button size="sm">Edit</Button>}
      divider
    />
    <SectionHeader title="Dense h3 header" as="h3" dense />
    <BorderedSection
      title="BorderedSection"
      actions={
        <Button size="sm" variant="secondary">
          Action
        </Button>
      }
    >
      Stacked content (the default layout).
    </BorderedSection>
    <BorderedSection title='layout="row"' layout="row" gap="md">
      <span>Side</span>
      <span>by</span>
      <span>side</span>
    </BorderedSection>
  </>
);
