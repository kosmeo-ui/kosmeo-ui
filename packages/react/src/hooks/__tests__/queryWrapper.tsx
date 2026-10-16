import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { ReactNode } from "react";
import { vi } from "vitest";

export const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

/** An AxiosInstance whose `get` resolves each URL through `respond`. */
export const mockAxios = (
  respond: (url: string, config?: unknown) => unknown
) => {
  const get = vi.fn(async (url: string, config?: unknown) => ({
    data: respond(url, config),
  }));
  return { get, instance: { get } as unknown as AxiosInstance };
};
