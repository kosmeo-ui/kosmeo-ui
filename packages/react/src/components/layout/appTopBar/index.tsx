"use client";

import useMediaQuery, { NARROW_SCREEN } from "../../../hooks/useMediaQuery.js";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./styles.css";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export interface AppTopBarProps {
  /** The app's mark and name, at the left. */
  brand: ReactNode;
  /** `AppTopBarLink`s. On narrow screens they fold behind a menu button. */
  children?: ReactNode;
  /** At the right, and kept in the bar on narrow screens: a theme toggle, the user menu. */
  actions?: ReactNode;
  /** Names the links' nav and the menu button that opens it. */
  navLabel?: string;
}

const AppTopBar = ({
  brand,
  children,
  actions,
  navLabel = "Menu",
}: AppTopBarProps) => {
  const narrow = useMediaQuery(NARROW_SCREEN);
  const [menuOpen, setMenuOpen] = useState(false);
  const navId = useId();
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = narrow && menuOpen;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // The menu hides, which would drop focus inside it to the body.
      if (navRef.current?.contains(document.activeElement)) {
        buttonRef.current?.focus();
      }
      setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const navClasses = ["k-app-top-bar-nav", narrow && "k-app-top-bar-nav-menu"]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={`k-app-top-bar${narrow ? " k-app-top-bar-narrow" : ""}`}>
      {narrow && (
        <button
          ref={buttonRef}
          type="button"
          className="k-app-top-bar-menu-button"
          aria-label={navLabel}
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={open ? faXmark : faBars} />
        </button>
      )}
      <div className="k-app-top-bar-brand">{brand}</div>
      <nav
        ref={navRef}
        id={navId}
        aria-label={navLabel}
        className={navClasses}
        hidden={narrow && !open}
        onClick={(e) => {
          if ((e.target as Element).closest("a")) setMenuOpen(false);
        }}
      >
        {children}
      </nav>
      {actions && <div className="k-app-top-bar-actions">{actions}</div>}
    </header>
  );
};

type AppTopBarLinkOwnProps<E extends ElementType> = {
  /** Element type used for the link. Pass `NavLink` from react-router for active styling. Defaults to `a`. */
  as?: E;
  /** Icon rendered before the label. */
  icon?: IconDefinition;
  children: ReactNode;
};

export type AppTopBarLinkProps<E extends ElementType = "a"> =
  AppTopBarLinkOwnProps<E> &
    Omit<ComponentPropsWithoutRef<E>, keyof AppTopBarLinkOwnProps<E>>;

export const AppTopBarLink = <E extends ElementType = "a">(
  props: AppTopBarLinkProps<E>
) => {
  const { as, icon, children, ...rest } = props as {
    as?: ElementType;
    icon?: IconDefinition;
    children: ReactNode;
  } & Record<string, unknown>;
  const Component: ElementType = as ?? "a";
  return (
    <Component {...rest} className="k-app-top-bar-link">
      {icon && <FontAwesomeIcon icon={icon} />}
      <span>{children}</span>
    </Component>
  );
};

export default AppTopBar;
