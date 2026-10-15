import { faHouse, faInbox, faGear } from "@fortawesome/free-solid-svg-icons";
import { Sidebar, SidebarNavGroup, SidebarNavLink } from "@kosmeo-ui/react";
import { useState, type ComponentProps } from "react";

// SidebarNavLink renders `as` (default "a"), styling `.active` links. Apps
// normally pass react-router's NavLink; this stand-in sets `active` itself.
const DemoLink = ({
  active,
  className,
  ...rest
}: ComponentProps<"a"> & { active?: boolean }) => (
  <a {...rest} className={active ? `${className} active` : className} />
);

const ITEMS = [
  { key: "home", label: "Home", icon: faHouse },
  { key: "inbox", label: "Inbox", icon: faInbox },
  { key: "settings", label: "Settings", icon: faGear },
];

export const SidebarExample = () => {
  const [current, setCurrent] = useState("home");

  return (
    <div className="demo-sidebar demo-sidebar-preview">
      <Sidebar>
        <SidebarNavGroup label="Navigation">
          {ITEMS.map((item) => (
            <SidebarNavLink
              key={item.key}
              as={DemoLink}
              href="#"
              icon={item.icon}
              active={current === item.key}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(item.key);
              }}
            >
              {item.label}
            </SidebarNavLink>
          ))}
        </SidebarNavGroup>
      </Sidebar>
    </div>
  );
};
