import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import type { Customer } from "@/types/api";
import { api } from "@/lib/api-client";

export const getCustomer = async ({
  customerId,
}: {
  customerId: string;
}): Promise<Customer> => {
  const res = await api.get<Customer>(`/customers/${customerId}`);
  return res.data;
};

export const getCustomerQueryOptions = (customerId: string) =>
  queryOptions({
    queryKey: ["customers", customerId],
    queryFn: () => getCustomer({ customerId }),
  });

type UseCustomerOptions = {
  customerId: string;
  queryConfig?: QueryConfig<typeof getCustomerQueryOptions>;
};

export const useCustomer = ({ customerId, queryConfig }: UseCustomerOptions) =>
  useQuery({ ...getCustomerQueryOptions(customerId), ...queryConfig });
