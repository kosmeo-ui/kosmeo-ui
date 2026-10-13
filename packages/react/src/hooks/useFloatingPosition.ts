import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export type FloatingSide = "below" | "top" | "bottom" | "left" | "right";

export interface FloatingPosition {
  top: number;
  left: number;
  width: number;
}

interface UseFloatingPositionOptions {
  isOpen: boolean;
  /** Placement relative to the anchor. `below` matches anchor width (default). */
  side?: FloatingSide;
  /** Ref to the floating element — required for `top`/`bottom`/`left`/`right`. */
  floatingRef?: RefObject<HTMLElement | null>;
  /** Distance in px between anchor and floating element (ignored for `below`). */
  offset?: number;
  /** Clamp position inside the viewport. */
  clampViewport?: boolean;
  /** Padding from viewport edges when clamping. */
  padding?: number;
}

/**
 * Tracks the screen position of a floating element anchored to a trigger.
 * Supports anchored-below dropdowns and side-positioned tooltips/popovers
 * with optional viewport clamping. Updates on scroll/resize while `isOpen`.
 */
const useFloatingPosition = ({
  isOpen,
  side = "below",
  floatingRef,
  offset = 0,
  clampViewport = false,
  padding = 8,
}: UseFloatingPositionOptions) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const a = anchor.getBoundingClientRect();
    const f = floatingRef?.current?.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (side === "below") {
      top = a.bottom;
      left = a.left;
    } else {
      if (!f) return;
      const centerX = a.left + (a.width - f.width) / 2;
      const centerY = a.top + (a.height - f.height) / 2;
      switch (side) {
        case "top":
          top = a.top - f.height - offset;
          left = centerX;
          break;
        case "bottom":
          top = a.bottom + offset;
          left = centerX;
          break;
        case "left":
          top = centerY;
          left = a.left - f.width - offset;
          break;
        case "right":
          top = centerY;
          left = a.right + offset;
          break;
      }
    }

    if (clampViewport && f) {
      left = Math.max(
        padding,
        Math.min(left, window.innerWidth - f.width - padding)
      );
      top = Math.max(
        padding,
        Math.min(top, window.innerHeight - f.height - padding)
      );
    }

    setPosition({ top, left, width: a.width });
  }, [side, offset, clampViewport, padding, floatingRef]);

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, update]);

  return { anchorRef, position, update };
};

export default useFloatingPosition;
