import { act, renderHook, waitFor } from "@testing-library/react";
import { api, createWrapper, serve } from "./queryWrapper.js";
import useInfiniteCursor from "../useInfiniteCursor.js";
import { describe, expect, it } from "vitest";

type Row = { id: number };

/** Two cursor pages: ids 1–3 then 3–5 (3 repeats across the boundary). */
const twoPages = (url: URL) =>
  url.searchParams.get("cursor") === "p2"
    ? {
        data: [{ id: 3 }, { id: 4 }, { id: 5 }],
        hasMore: false,
        limit: 3,
        nextCursor: null,
      }
    : {
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        hasMore: true,
        limit: 3,
        nextCursor: "p2",
      };

const setup = (respond: (url: URL) => unknown = twoPages) => {
  const requests = serve("/rows", respond);
  const hook = renderHook(
    () =>
      useInfiniteCursor<Row>({
        axiosInstance: api(),
        endpoint: "/rows",
        queryKey: "rows",
        initialLimit: 3,
      }),
    { wrapper: createWrapper() }
  );
  return { ...hook, requests };
};

describe("useInfiniteCursor", () => {
  it("loads the first page", async () => {
    const { result, requests } = setup();

    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.total).toBe(0);
    expect(requests.map((url) => url.search)).toEqual(["?limit=3"]);
  });

  it("fetches the next page when the same query is asked for again", async () => {
    const { result, requests } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => result.current.onQueryChange("limit=3&offset=3"));

    await waitFor(() =>
      expect(result.current.data.map((r) => r.id)).toEqual([1, 2, 3, 4, 5])
    );
    expect(result.current.hasMore).toBe(false);
    expect(requests.at(-1)?.search).toBe("?limit=3&cursor=p2");
  });

  it("starts over when the query changes, dropping any offset", async () => {
    const { result, requests } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => result.current.onQueryChange("limit=3&offset=0&sort=name"));

    await waitFor(() =>
      expect(requests.at(-1)?.search).toBe("?limit=3&sort=name")
    );
  });

  it("asks for the next page once while it's loading", async () => {
    let release!: () => void;
    const { result, requests } = setup(async (url) => {
      // The second page waits until the test releases it.
      if (url.searchParams.has("cursor"))
        await new Promise<void>((resolve) => (release = resolve));
      return twoPages(url);
    });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    act(() => result.current.onQueryChange("limit=3&offset=3"));
    await waitFor(() => expect(requests).toHaveLength(2));

    // Scroll events keep asking while the next page is still loading.
    act(() => result.current.onQueryChange("limit=3&offset=3"));
    act(() => release());

    await waitFor(() => expect(result.current.data).toHaveLength(5));
    expect(requests).toHaveLength(2);
  });

  it("asks for the next page once when asked twice in one tick", async () => {
    const { result, requests } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    // No re-render between the two calls, so neither sees the other's request.
    act(() => {
      result.current.onQueryChange("limit=3&offset=3");
      result.current.onQueryChange("limit=3&offset=3");
    });

    await waitFor(() => expect(result.current.data).toHaveLength(5));
    expect(requests).toHaveLength(2);
  });
});
