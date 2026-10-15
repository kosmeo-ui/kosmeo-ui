import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/hooks/use-theme";
import { paths } from "@/config/paths";
import { NavLink } from "react-router";
import type { ReactNode } from "react";
import {
  faChartLine,
  faGear,
  faRightToBracket,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  Sidebar,
  SidebarNavGroup,
  SidebarNavLink,
  Switch,
} from "@kosmeo-ui/react";

export interface NavGroup {
  label: string;
  links: { label: string; href: string; icon?: IconDefinition }[];
}

export const DashboardLayout = ({
  children,
  navGroups = [],
}: {
  children: ReactNode;
  /** Extra sidebar groups, composed in by the app from feature data. */
  navGroups?: NavGroup[];
}) => {
  const [theme, setTheme] = useTheme();

  return (
    <div className="demo-shell">
      <aside className="demo-sidebar">
        <div className="demo-brand">
          <img src="/logo.svg" alt="" />
          <span>Kosmeo Demo</span>
        </div>
        <Sidebar>
          <SidebarNavGroup label="Workspace">
            <SidebarNavLink
              as={NavLink}
              to={paths.app.dashboard.getHref()}
              end
              icon={faChartLine}
            >
              Dashboard
            </SidebarNavLink>
            <SidebarNavLink
              as={NavLink}
              to={paths.app.customers.getHref()}
              end
              icon={faUsers}
            >
              Customers
            </SidebarNavLink>
            <SidebarNavLink
              as={NavLink}
              to={paths.app.newCustomer.getHref()}
              icon={faUserPlus}
            >
              New customer
            </SidebarNavLink>
          </SidebarNavGroup>
          <SidebarNavGroup label="Account">
            <SidebarNavLink
              as={NavLink}
              to={paths.app.settings.getHref()}
              icon={faGear}
            >
              Settings
            </SidebarNavLink>
            <SidebarNavLink
              as={NavLink}
              to={paths.auth.signIn.getHref()}
              icon={faRightToBracket}
            >
              Sign-in page
            </SidebarNavLink>
          </SidebarNavGroup>
          {navGroups.map((group) => (
            <SidebarNavGroup key={group.label} label={group.label}>
              {group.links.map((link) => (
                <SidebarNavLink
                  key={link.href}
                  as={NavLink}
                  to={link.href}
                  icon={link.icon}
                >
                  {link.label}
                </SidebarNavLink>
              ))}
            </SidebarNavGroup>
          ))}
        </Sidebar>
        <div className="demo-sidebar-footer">
          <Switch
            size="sm"
            label="Dark mode"
            checked={theme === "dark"}
            onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
          />
        </div>
      </aside>
      <main className="demo-main">{children}</main>
    </div>
  );
};
