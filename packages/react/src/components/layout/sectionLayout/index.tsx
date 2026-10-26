"use client";

import useMediaQuery, { NARROW_SCREEN } from "../../../hooks/useMediaQuery.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useLocalStorage from "../../../hooks/useLocalStorage.js";
import "./styles.css";
import {
  faBars,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface SectionLayoutProps {
  /** Heads the sidebar and names it; on narrow screens, also the drawer's toggle. */
  title: string;
  /** The section's nav, usually a `Sidebar`. */
  sidebar: ReactNode;
  /** The page beside the sidebar, such as a router `<Outlet />`. */
  children: ReactNode;
  /** localStorage key that remembers whether the sidebar is collapsed. */
  collapsedStorageKey?: string;
}

const subscribeToNothing = () => () => {};

const SectionLayout = ({
  title,
  sidebar,
  children,
  collapsedStorageKey = "k-section-layout-collapsed",
}: SectionLayoutProps) => {
  const [storedCollapsed, setCollapsed] =
    useLocalStorage<boolean>(collapsedStorageKey);
  // False while hydrating, so a stored collapse can't mismatch the server's HTML.
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
  const collapsed = hydrated && !!storedCollapsed;
  const narrow = useMediaQuery(NARROW_SCREEN);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarId = useId();
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const open = narrow && drawerOpen;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // The drawer goes inert, which would drop focus inside it to the body.
      if (sidebarRef.current?.contains(document.activeElement)) {
        toggleRef.current?.focus();
      }
      setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const sidebarClasses = [
    "k-section-layout-sidebar",
    !narrow && collapsed && "k-section-layout-sidebar-collapsed",
    narrow && "k-section-layout-drawer",
    open && "k-section-layout-drawer-open",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`k-section-layout${narrow ? " k-section-layout-narrow" : ""}`}
    >
      {narrow && (
        <div className="k-section-layout-bar">
          <button
            ref={toggleRef}
            type="button"
            className="k-section-layout-bar-toggle"
            aria-expanded={open}
            aria-controls={sidebarId}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
            {title}
          </button>
        </div>
      )}
      {open && (
        <div
          className="k-section-layout-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id={sidebarId}
        className={sidebarClasses}
        aria-label={title}
        // Off screen while closed, so its links stay out of the tab order.
        inert={narrow && !open}
        onClick={(e) => {
          if ((e.target as Element).closest("a")) setDrawerOpen(false);
        }}
      >
        <div className="k-section-layout-sidebar-header">
          <h3>{title}</h3>
          {!narrow && (
            <button
              type="button"
              className="k-section-layout-collapse-button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-controls={sidebarId}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              <FontAwesomeIcon
                icon={collapsed ? faChevronRight : faChevronLeft}
              />
            </button>
          )}
        </div>
        {sidebar}
      </aside>
      <main className="k-section-layout-main">{children}</main>
    </div>
  );
};

export default SectionLayout;
