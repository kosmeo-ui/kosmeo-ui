import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersPagedQueryKey } from "./get-customers-page";
import { customersInfiniteQueryKey } from "./get-customers";
import type { Customer, CustomerInput } from "@/types/api";
import type { MutationConfig } from "@/lib/react-query";
import { api } from "@/lib/api-client";

export const createCustomer = async ({
  data,
}: {
  data: CustomerInput;
}): Promise<Customer> => {
  const res = await api.post<Customer>("/customers", data);
  return res.data;
};

type UseCreateCustomerOptions = {
  mutationConfig?: MutationConfig<typeof createCustomer>;
};

export const useCreateCustomer = ({
  mutationConfig,
}: UseCreateCustomerOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: customersInfiniteQueryKey });
      queryClient.invalidateQueries({ queryKey: customersPagedQueryKey });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createCustomer,
  });
};
