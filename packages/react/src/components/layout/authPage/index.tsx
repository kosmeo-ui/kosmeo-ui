"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface AuthPageProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Max card width. Defaults to "narrow" = 25rem. "wide" = 31rem. */
  width?: "narrow" | "wide";
  children: ReactNode;
  /** Optional footer below card (e.g., "Already have account? Sign in"). */
  footer?: ReactNode;
}

const AuthPage = ({
  title,
  subtitle,
  width = "narrow",
  children,
  footer,
}: AuthPageProps) => {
  return (
    <div className="k-auth-page">
      <div className={`k-auth-page-card k-auth-page-card-${width}`}>
        <div className="k-auth-page-header">
          <h1 className="k-auth-page-title">{title}</h1>
          {subtitle && <p className="k-auth-page-subtitle">{subtitle}</p>}
        </div>
        <div className="k-auth-page-body">{children}</div>
      </div>
      {footer && <div className="k-auth-page-footer">{footer}</div>}
    </div>
  );
};

export default AuthPage;
