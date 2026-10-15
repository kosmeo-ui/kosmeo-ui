import {
  Badge,
  Button,
  FormGrid,
  ListCard,
  ListRow,
  TagCard,
} from "@kosmeo-ui/react";

export const Lists = () => (
  <>
    <FormGrid columns={2}>
      <ListCard
        listTitle="ListCard"
        headerActions={<Badge variant="success">Active</Badge>}
        items={[
          { label: "Plan", value: "Growth" },
          { label: "Seats", value: 12 },
          { label: "Renews", value: "Nov 1, 2026" },
        ]}
        footerButtons={
          <Button size="sm" variant="secondary">
            Manage
          </Button>
        }
      />
      <div>
        <TagCard title="TagCard" tags={["design", "frontend", "a11y"]} />
        <TagCard title='color="secondary"' color="secondary" tags={["beta"]} />
        <TagCard title="No tags" tags={[]} emptyText="Nothing tagged yet" />
      </div>
    </FormGrid>
    <div>
      <ListRow
        actions={
          <Button size="sm" variant="link">
            Open
          </Button>
        }
      >
        ListRow with trailing actions
      </ListRow>
      <ListRow actions={<Badge size="sm">new</Badge>}>Another ListRow</ListRow>
      <ListRow>A ListRow with no actions</ListRow>
    </div>
  </>
);
