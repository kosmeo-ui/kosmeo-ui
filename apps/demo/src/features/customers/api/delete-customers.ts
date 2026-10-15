import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersPagedQueryKey } from "./get-customers-page";
import { customersInfiniteQueryKey } from "./get-customers";
import type { MutationConfig } from "@/lib/react-query";
import { api } from "@/lib/api-client";

export const deleteCustomers = async ({
  customerIds,
}: {
  customerIds: string[];
}) => {
  await Promise.all(customerIds.map((id) => api.delete(`/customers/${id}`)));
};

type UseDeleteCustomersOptions = {
  mutationConfig?: MutationConfig<typeof deleteCustomers>;
};

export const useDeleteCustomers = ({
  mutationConfig,
}: UseDeleteCustomersOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      const [, { customerIds }] = args;
      // Skip the deleted customers' own queries: refetching them would 404
      // while their detail page is still mounted.
      queryClient.invalidateQueries({
        queryKey: ["customers"],
        predicate: (query) =>
          !customerIds.includes(query.queryKey[1] as string),
      });
      queryClient.invalidateQueries({ queryKey: customersInfiniteQueryKey });
      queryClient.invalidateQueries({ queryKey: customersPagedQueryKey });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteCustomers,
  });
};
