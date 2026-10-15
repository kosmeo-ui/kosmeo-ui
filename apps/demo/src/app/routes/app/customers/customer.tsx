import { getCustomerQueryOptions } from "@/features/customers/api/get-customer";
import { CustomerView } from "@/features/customers/components/customer-view";
import { useParams, type LoaderFunctionArgs } from "react-router";
import type { QueryClient } from "@tanstack/react-query";

// A missing customer isn't a route error: the view renders its own not-found.
export const clientLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const query = getCustomerQueryOptions(params.customerId as string);
    await queryClient.ensureQueryData(query).catch(() => null);
    return null;
  };

const CustomerRoute = () => {
  const { customerId } = useParams();
  return <CustomerView key={customerId} customerId={customerId as string} />;
};

export default CustomerRoute;
