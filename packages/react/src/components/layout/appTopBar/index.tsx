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
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface AppTopBarProps {
  /** The app's mark and name, at the left. */
  brand: ReactNode;
  /**
   * `AppTopBarLink`s. They fold behind a menu button on narrow screens, and
   * whenever they don't fit between the brand and the actions.
   */
  children?: ReactNode;
  /** At the right, and kept in the bar when the links fold: a theme toggle, the user menu. */
  actions?: ReactNode;
  /** Names the links' nav and the menu button that opens it. */
  navLabel?: string;
}

const outerWidth = (el: HTMLElement | null) => {
  if (!el) return 0;
  const style = getComputedStyle(el);
  return (
    el.getBoundingClientRect().width +
    (parseFloat(style.marginLeft) || 0) +
    (parseFloat(style.marginRight) || 0)
  );
};

const AppTopBar = ({
  brand,
  children,
  actions,
  navLabel = "Menu",
}: AppTopBarProps) => {
  const narrow = useMediaQuery(NARROW_SCREEN);
  // The links' width when they last overflowed, or null while they fit.
  const [neededWidth, setNeededWidth] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navId = useId();
  const slotRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const folded = narrow || neededWidth !== null;
  const open = folded && menuOpen;

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const nav = navRef.current;
    if (narrow || !slot || !nav) return;
    const measure = () => {
      const room = slot.getBoundingClientRect().width;
      if (neededWidth === null) {
        const width = nav.getBoundingClientRect().width;
        // The slack keeps sub-pixel rounding from folding links that just fit.
        if (width > room + 0.5) setNeededWidth(width);
        return;
      }
      // Folded, the links aren't laid out, so unfold only once the room they
      // needed is there; the menu button's space comes back with them.
      if (room + outerWidth(buttonRef.current) >= neededWidth) {
        setNeededWidth(null);
      }
    };
    measure();
    // Optional: jsdom, where apps run their tests, has no ResizeObserver.
    const resizes =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    resizes?.observe(slot);
    resizes?.observe(nav);
    // Links that change while folded can't be measured: unfold to measure them.
    const mutations =
      neededWidth === null
        ? null
        : new MutationObserver(() => setNeededWidth(null));
    mutations?.observe(nav, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => {
      resizes?.disconnect();
      mutations?.disconnect();
    };
  }, [narrow, neededWidth]);

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

  const navClasses = ["k-app-top-bar-nav", folded && "k-app-top-bar-nav-menu"]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={`k-app-top-bar${narrow ? " k-app-top-bar-narrow" : ""}`}>
      {folded && (
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
      {/* The room between the brand and the actions, measured even while the links are folded. */}
      <div ref={slotRef} className="k-app-top-bar-nav-slot">
        <nav
          ref={navRef}
          id={navId}
          aria-label={navLabel}
          className={navClasses}
          hidden={folded && !open}
          onClick={(e) => {
            if ((e.target as Element).closest("a")) setMenuOpen(false);
          }}
        >
          {children}
        </nav>
      </div>
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
