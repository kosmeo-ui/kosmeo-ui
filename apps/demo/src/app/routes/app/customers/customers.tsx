import { CustomersPagedTable } from "@/features/customers/components/customers-paged-table";
import { CustomersList } from "@/features/customers/components/customers-list";
import { useSearchParams } from "react-router";
import { Page, Tabs } from "@kosmeo-ui/react";

const VIEWS = [
  { key: "scroll", label: "Infinite scroll" },
  { key: "pages", label: "Pages" },
];

// Both views list the same customers; the choice lives in the URL
// (?view=pages) so it survives a reload and can be linked to.
const CustomersRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "pages" ? "pages" : "scroll";

  const viewSwitch = (
    <Tabs
      stripOnly
      tabs={VIEWS}
      active={view}
      onChange={(key) =>
        setSearchParams(key === "pages" ? { view: "pages" } : {}, {
          replace: true,
        })
      }
    />
  );

  return view === "pages" ? (
    <Page padded gap="md" maxWidth="none">
      {viewSwitch}
      <CustomersPagedTable />
    </Page>
  ) : (
    <Page fillHeight padded gap="md" maxWidth="none">
      {viewSwitch}
      <CustomersList />
    </Page>
  );
};

export default CustomersRoute;
