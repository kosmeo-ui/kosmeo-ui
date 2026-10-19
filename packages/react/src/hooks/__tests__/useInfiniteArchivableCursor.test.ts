import useInfiniteArchivableCursor from "../useInfiniteArchivableCursor.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { api, createWrapper, serve } from "./queryWrapper.js";
import { describe, expect, it } from "vitest";
import { HttpResponse } from "msw";

const onePage = () => ({
  data: [{ id: 1 }],
  hasMore: false,
  limit: 10,
  nextCursor: null,
});

const setup = () => {
  const requests = serve("/projects", onePage);
  const hook = renderHook(
    () =>
      useInfiniteArchivableCursor<{ id: number }>({
        axiosInstance: api(),
        endpoint: "/projects",
        queryKey: ["projects", "org-1"],
      }),
    { wrapper: createWrapper() }
  );
  return { ...hook, requests };
};

describe("useInfiniteArchivableCursor", () => {
  it("lifts the Archived filter to a top-level includeArchived flag", async () => {
    const { result, requests } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() =>
      result.current.onQueryChange(
        "limit=10&filter%5BincludeArchived%5D=true&filter%5BincludeArchived_op%5D=eq"
      )
    );

    await waitFor(() =>
      expect(requests.at(-1)?.search).toBe("?limit=10&includeArchived=true")
    );
  });

  it("omits the flag when archived rows aren't asked for", async () => {
    const { result, requests } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() =>
      result.current.onQueryChange("limit=10&filter%5BincludeArchived%5D=false")
    );

    await waitFor(() => expect(requests.at(-1)?.search).toBe("?limit=10"));
  });

  it("asks for the next page once when asked twice in one tick", async () => {
    const requests = serve("/projects", (url) =>
      url.searchParams.get("cursor") === "p2"
        ? { data: [{ id: 2 }], hasMore: false, limit: 1, nextCursor: null }
        : { data: [{ id: 1 }], hasMore: true, limit: 1, nextCursor: "p2" }
    );
    const { result } = renderHook(
      () =>
        useInfiniteArchivableCursor<{ id: number }>({
          axiosInstance: api(),
          endpoint: "/projects",
          queryKey: "projects",
          initialLimit: 1,
        }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() => {
      result.current.onQueryChange("limit=1&offset=1");
      result.current.onQueryChange("limit=1&offset=1");
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(requests).toHaveLength(2);
  });

  it("reports a failed request as its error", async () => {
    serve("/projects", () => HttpResponse.json(null, { status: 500 }));

    const { result } = renderHook(
      () =>
        useInfiniteArchivableCursor<{ id: number }>({
          axiosInstance: api(),
          endpoint: "/projects",
          queryKey: "projects",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() =>
      expect(result.current.error?.message).toBe(
        "Request failed with status code 500"
      )
    );
  });

  it("offers no more pages after a failed next page", async () => {
    serve("/projects", (url) =>
      url.searchParams.get("cursor") === "p2"
        ? HttpResponse.json(null, { status: 500 })
        : { data: [{ id: 1 }], hasMore: true, limit: 1, nextCursor: "p2" }
    );
    const { result } = renderHook(
      () =>
        useInfiniteArchivableCursor<{ id: number }>({
          axiosInstance: api(),
          endpoint: "/projects",
          queryKey: "projects",
          initialLimit: 1,
        }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() => result.current.onQueryChange("limit=1&offset=1"));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.hasMore).toBe(false);
  });
});
