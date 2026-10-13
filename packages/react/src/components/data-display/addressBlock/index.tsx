"use client";

import { ReactNode } from "react";
import "./styles.css";

export interface AddressBlockAddress {
  name?: string | null;
  company?: string | null;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface AddressBlockProps {
  address: AddressBlockAddress;
  /** Uppercase label rendered above the address (e.g. "Ship to"). */
  label?: ReactNode;
  /** "full" (default): name+company+full multi-line. "compact": single block. */
  variant?: "full" | "compact";
  /** Suppress phone + email lines. */
  hideContact?: boolean;
}

const join = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(", ");

const AddressBlock = ({
  address,
  label,
  variant = "full",
  hideContact,
}: AddressBlockProps) => {
  const cityLine = [address.city, address.stateProvince, address.postalCode]
    .filter(Boolean)
    .join(" ");
  const region = join(cityLine, address.countryCode ?? undefined);

  return (
    <div className={`k-address-block k-address-block-${variant}`}>
      {label && <div className="k-address-block-label">{label}</div>}
      <address className="k-address-block-body">
        {variant === "full" && (address.name || address.company) && (
          <div className="k-address-block-name">
            {address.name}
            {address.name && address.company && " · "}
            {address.company}
          </div>
        )}
        {address.street1 && (
          <div className="k-address-block-street">{address.street1}</div>
        )}
        {address.street2 && (
          <div className="k-address-block-street">{address.street2}</div>
        )}
        {region && <div className="k-address-block-region">{region}</div>}
        {!hideContact && (address.phone || address.email) && (
          <div className="k-address-block-contact">
            {[address.phone, address.email].filter(Boolean).join(" · ")}
          </div>
        )}
      </address>
    </div>
  );
};

export default AddressBlock;
