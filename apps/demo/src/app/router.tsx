import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { paths } from "@/config/paths";
import { useMemo } from "react";
import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from "./routes/app/root";

// Turns a lazily imported route module into a route object: its default export
// is the component, and `clientLoader` gets the QueryClient to prefetch with.
const convert =
  (queryClient: QueryClient) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (m: any) => {
    const { clientLoader, default: Component, ...rest } = m;
    return { ...rest, loader: clientLoader?.(queryClient), Component };
  };

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: paths.auth.signIn.path,
      lazy: () => import("./routes/auth/sign-in").then(convert(queryClient)),
    },
    {
      path: paths.app.root.path,
      element: <AppRoot />,
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: () =>
            import("./routes/app/dashboard").then(convert(queryClient)),
        },
        {
          path: paths.app.customers.path,
          lazy: () =>
            import("./routes/app/customers/customers").then(
              convert(queryClient)
            ),
        },
        {
          path: paths.app.newCustomer.path,
          lazy: () =>
            import("./routes/app/customers/new-customer").then(
              convert(queryClient)
            ),
        },
        {
          path: paths.app.customer.path,
          lazy: () =>
            import("./routes/app/customers/customer").then(
              convert(queryClient)
            ),
        },
        {
          path: paths.app.settings.path,
          lazy: () =>
            import("./routes/app/settings").then(convert(queryClient)),
        },
        {
          path: paths.app.gallery.path,
          lazy: () => import("./routes/app/gallery").then(convert(queryClient)),
        },
      ],
    },
    {
      path: "*",
      lazy: () => import("./routes/not-found").then(convert(queryClient)),
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
