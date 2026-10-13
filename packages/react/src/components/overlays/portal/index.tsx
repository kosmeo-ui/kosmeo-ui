import { createPortal } from "react-dom";
import { ReactNode } from "react";

interface PortalProps {
  children: ReactNode;
  /** Target node. Defaults to `document.body`. */
  target?: Element | DocumentFragment;
}

/** Thin wrapper around `createPortal` — single seam for overlay-root swaps. */
const Portal = ({ children, target }: PortalProps) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, target ?? document.body);
};

export default Portal;
