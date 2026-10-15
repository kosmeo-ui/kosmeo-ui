import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainErrorFallback } from "@/components/errors/main";
import { useState, Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Centered, Spinner } from "@kosmeo-ui/react";
import { queryConfig } from "@/lib/react-query";
import { ToastContainer } from "react-toastify";
import { useTheme } from "@/hooks/use-theme";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: queryConfig })
  );
  useTheme();

  return (
    <Suspense
      fallback={
        <Centered>
          <Spinner size="lg" />
        </Centered>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};
