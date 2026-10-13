"use client";

import { useEffect, useRef, useState } from "react";
import Portal from "../../overlays/portal/index.js";
import "./styles.css";
import useFloatingPosition, {
  FloatingSide,
} from "../../../hooks/useFloatingPosition.js";

type TooltipSide = Exclude<FloatingSide, "below">;

export interface TooltipProps {
  /** The element(s) that the Tooltip will appear around */
  children: React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;
  /** The content to appear inside the Tooltip */
  content: React.ReactNode;
  /**
   * **_Optional_** position of the Tooltip relative to the children.
   *
   * Defaults to `top`.
   */
  position?: TooltipSide;
  /**
   * **_Optional_** whether the tooltip container should take full width.
   *
   * Defaults to `false`.
   */
  fullWidth?: boolean;
  /**
   * **_Optional_** whether the tooltip is disabled.
   *
   * Defaults to `false`.
   */
  disabled?: boolean;
}

const Tooltip = (props: TooltipProps) => {
  const { position = "top", fullWidth = false, disabled = false } = props;

  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { anchorRef, position: tooltipPos } = useFloatingPosition({
    isOpen: isVisible,
    side: position,
    floatingRef: tooltipRef,
    offset: 13,
    clampViewport: true,
  });

  useEffect(() => {
    if (!isVisible) return;
    const handleScroll = () => setIsVisible(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isVisible]);

  const handleMouseEnter = () => !disabled && setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleFocus = () => !disabled && setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  return (
    <>
      <div
        ref={anchorRef}
        className={`k-tooltip-container ${
          fullWidth ? "k-tooltip-container-full-width" : ""
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {props.children}
      </div>
      {isVisible && (
        <Portal>
          <div
            ref={tooltipRef}
            className={`k-tooltip-wrapper k-tooltip-${position} k-tooltip-wrapper-${
              tooltipPos ? "visible" : "hidden"
            }`}
            style={{
              top: `${tooltipPos?.top ?? 0}px`,
              left: `${tooltipPos?.left ?? 0}px`,
            }}
          >
            <div className="k-tooltip-content">{props.content}</div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default Tooltip;
