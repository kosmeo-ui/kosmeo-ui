"use client";

import { useEffect, useRef, useState } from "react";
import Spinner from "../spinner/index.js";
import "./styles.css";

export interface LoadingProps {
  /** Whether or not the loading overlay should be shown */
  show: boolean;
  /** Message to display below the loading image */
  message: string;
  /** If true, overlay covers entire viewport. If false, stays within parent element (parent must have position: relative) */
  fullPage?: boolean;
}

const LoadingOverlay = (props: LoadingProps) => {
  const { fullPage = true } = props;
  const [showLoader, setShowLoader] = useState(false);
  const loadStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (props.show) {
      loadStartTime.current = Date.now();
      setShowLoader(true);
    } else if (loadStartTime.current) {
      const loadTime = Date.now() - loadStartTime.current;
      if (loadTime >= 1000) setShowLoader(false);
      else {
        const timeout = setTimeout(() => {
          setShowLoader(false);
        }, 1000 - loadTime);
        return () => clearTimeout(timeout);
      }
    }
  }, [props.show]);

  return (
    <div
      className={`k-loading-container ${fullPage ? "k-loading-container-fixed" : "k-loading-container-absolute"} ${showLoader ? "k-loading-visible" : "k-loading-hidden"}`}
    >
      <div className="k-loading-content">
        <Spinner size="lg" />
        <p className="k-loading-message">{props.message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
