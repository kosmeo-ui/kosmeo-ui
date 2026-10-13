import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./styles.css";

export interface SidebarProps {
  children: ReactNode;
}

export const Sidebar = ({ children }: SidebarProps) => {
  return <nav className="k-sidebar-nav">{children}</nav>;
};

export interface SidebarNavGroupProps {
  label: ReactNode;
  children: ReactNode;
}

export const SidebarNavGroup = ({ label, children }: SidebarNavGroupProps) => {
  return (
    <div className="k-sidebar-nav-group">
      <div className="k-sidebar-nav-group-label">{label}</div>
      {children}
    </div>
  );
};

type SidebarNavLinkOwnProps<E extends ElementType> = {
  /** Element type used for the link. Pass `NavLink` from react-router for active styling. Defaults to `a`. */
  as?: E;
  /** Icon rendered before the label. */
  icon?: IconDefinition;
  children: ReactNode;
};

export type SidebarNavLinkProps<E extends ElementType = "a"> =
  SidebarNavLinkOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof SidebarNavLinkOwnProps<E>>;

export const SidebarNavLink = <E extends ElementType = "a">(
  props: SidebarNavLinkProps<E>
) => {
  const { as, icon, children, ...rest } = props as {
    as?: ElementType;
    icon?: IconDefinition;
    children: ReactNode;
  } & Record<string, unknown>;
  const Component: ElementType = as ?? "a";
  return (
    <Component {...rest} className="k-sidebar-nav-link">
      {icon && <FontAwesomeIcon icon={icon} />}
      <span>{children}</span>
    </Component>
  );
};

export default Sidebar;
