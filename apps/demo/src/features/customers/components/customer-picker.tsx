import { useSearchCustomers } from "../api/search-customers";
import { SearchList } from "@kosmeo-ui/react";
import type { Customer } from "@/types/api";
import { useState } from "react";

export const CustomerPicker = ({
  label,
  onChange,
}: {
  label: string;
  onChange?: (customer: Customer | null) => void;
}) => {
  const [value, setValue] = useState<Customer | null>(null);

  return (
    <SearchList<Customer>
      label={label}
      placeholder="Search customers by name"
      value={value}
      onSelect={(customer) => {
        setValue(customer);
        onChange?.(customer);
      }}
      queryFn={useSearchCustomers}
      labelKey="name"
      searchKey="name"
      max={8}
      renderOption={(c) => ({
        label: c.name,
        node: (
          <span>
            {c.name} <small className="demo-muted">· {c.company}</small>
          </span>
        ),
      })}
    />
  );
};
