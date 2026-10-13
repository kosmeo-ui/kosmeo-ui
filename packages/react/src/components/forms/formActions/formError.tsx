"use client";

import { ReactNode } from "react";

export interface FormErrorProps {
  children: ReactNode;
}

const FormError = ({ children }: FormErrorProps) => {
  return (
    <div role="alert" className="k-form-error">
      {children}
    </div>
  );
};

export default FormError;
