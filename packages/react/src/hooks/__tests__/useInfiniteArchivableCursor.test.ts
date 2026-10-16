import useInfiniteArchivableCursor from "../useInfiniteArchivableCursor.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createWrapper, mockAxios } from "./queryWrapper.js";
import { describe, expect, it } from "vitest";

const setup = () => {
  const axios = mockAxios(() => ({
    data: [{ id: 1 }],
    hasMore: false,
    limit: 10,
    nextCursor: null,
  }));
  const hook = renderHook(
    () =>
      useInfiniteArchivableCursor<{ id: number }>({
        axiosInstance: axios.instance,
        endpoint: "/projects",
        queryKey: ["projects", "org-1"],
      }),
    { wrapper: createWrapper() }
  );
  return { ...hook, axios };
};

describe("useInfiniteArchivableCursor", () => {
  it("lifts the Archived filter to a top-level includeArchived flag", async () => {
    const { result, axios } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() =>
      result.current.onQueryChange(
        "limit=10&filter%5BincludeArchived%5D=true&filter%5BincludeArchived_op%5D=eq"
      )
    );

    await waitFor(() =>
      expect(axios.get).toHaveBeenLastCalledWith(
        "/projects?limit=10&includeArchived=true"
      )
    );
  });

  it("omits the flag when archived rows aren't asked for", async () => {
    const { result, axios } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    act(() =>
      result.current.onQueryChange("limit=10&filter%5BincludeArchived%5D=false")
    );

    await waitFor(() =>
      expect(axios.get).toHaveBeenLastCalledWith("/projects?limit=10")
    );
  });

  it("asks for the next page once when asked twice in one tick", async () => {
    const axios = mockAxios((url) =>
      url.includes("cursor=p2")
        ? { data: [{ id: 2 }], hasMore: false, limit: 1, nextCursor: null }
        : { data: [{ id: 1 }], hasMore: true, limit: 1, nextCursor: "p2" }
    );
    const { result } = renderHook(
      () =>
        useInfiniteArchivableCursor<{ id: number }>({
          axiosInstance: axios.instance,
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
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
