import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, JsonBodyType } from "msw";
import { server } from "./server.js";
import { ReactNode } from "react";
import axios from "axios";

export const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

/** A real AxiosInstance, as an app passes one in; msw answers its requests. */
export const api = () => axios.create();

/**
 * Serves GET `path` with what `respond` returns for each request's URL —
 * JSON data, or a Response such as `HttpResponse.json(null, { status: 500 })`
 * — and records every URL requested, in order.
 */
export const serve = (
  path: string,
  respond: (url: URL) => unknown | Response | Promise<unknown | Response>
) => {
  const requests: URL[] = [];
  server.use(
    http.get(path, async ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      const body = await respond(url);
      return body instanceof Response
        ? body
        : HttpResponse.json(body as JsonBodyType);
    })
  );
  return requests;
};
