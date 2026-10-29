import { useState, type ComponentProps } from "react";
import {
  faBook,
  faChartLine,
  faCreditCard,
  faGear,
  faInbox,
  faPlug,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  AppTopBar,
  AppTopBarLink,
  Button,
  SectionLayout,
  Sidebar,
  SidebarNavLink,
} from "@kosmeo-ui/react";

// Apps pass react-router's NavLink as `as`; this stand-in sets `active` itself.
const DemoLink = ({
  active,
  className,
  ...rest
}: ComponentProps<"a"> & { active?: boolean }) => (
  <a {...rest} className={active ? `${className} active` : className} />
);

const PAGES = [
  { key: "users", label: "Users", icon: faUsers },
  { key: "inbox", label: "Inbox", icon: faInbox },
  { key: "settings", label: "Settings", icon: faGear },
];

// The links fold into a menu when they don't fit beside the brand and the
// actions, and always below 768px, where the sidebar also becomes a drawer.
export const AppShellExample = () => {
  const [page, setPage] = useState("users");
  const current = PAGES.find((p) => p.key === page)!;

  return (
    <div className="demo-app-shell">
      <AppTopBar
        brand={
          <>
            <img src="/logo.svg" alt="" />
            Kosmeo
          </>
        }
        navLabel="Sections"
        actions={<Button size="sm">Sign out</Button>}
      >
        <AppTopBarLink as={DemoLink} href="#" icon={faUsers} active>
          Admin
        </AppTopBarLink>
        <AppTopBarLink href="#" icon={faChartLine}>
          Reports
        </AppTopBarLink>
        <AppTopBarLink href="#" icon={faCreditCard}>
          Billing
        </AppTopBarLink>
        <AppTopBarLink href="#" icon={faPlug}>
          Integrations
        </AppTopBarLink>
        <AppTopBarLink href="#" icon={faBook}>
          Docs
        </AppTopBarLink>
      </AppTopBar>
      <div className="demo-app-shell-body">
        <SectionLayout
          title="Admin"
          collapsedStorageKey="demo-app-shell-collapsed"
          sidebar={
            <Sidebar>
              {PAGES.map((p) => (
                <SidebarNavLink
                  key={p.key}
                  as={DemoLink}
                  href="#"
                  icon={p.icon}
                  active={p.key === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p.key);
                  }}
                >
                  {p.label}
                </SidebarNavLink>
              ))}
            </Sidebar>
          }
        >
          <h3>{current.label}</h3>
          <p>The page goes here, usually a router {"<Outlet />"}.</p>
        </SectionLayout>
      </div>
    </div>
  );
};
