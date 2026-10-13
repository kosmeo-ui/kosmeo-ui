"use client";

import { RefObject, useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Traps Tab focus inside `containerRef` while `enabled`. Focuses the first
 * focusable element on activation and restores the previously focused element
 * on deactivation.
 */
const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean
) => {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const prevActive = document.activeElement as HTMLElement | null;
    const getFocusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    getFocusables()[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = getFocusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      prevActive?.focus?.();
    };
  }, [enabled, containerRef]);
};

export default useFocusTrap;
