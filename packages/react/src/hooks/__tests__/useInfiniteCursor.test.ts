import { act, renderHook, waitFor } from "@testing-library/react";
import { createWrapper, mockAxios } from "./queryWrapper.js";
import useInfiniteCursor from "../useInfiniteCursor.js";
import { describe, expect, it, vi } from "vitest";
import type { AxiosInstance } from "axios";

type Row = { id: number };

/** Two cursor pages: ids 1–3 then 3–5 (3 repeats across the boundary). */
const server = () =>
  mockAxios((url) => {
    const cursor = new URL(url, "http://x").searchParams.get("cursor");
    return cursor === "p2"
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
  });

const setup = (axios: { instance: AxiosInstance } = server()) =>
  renderHook(
    () =>
      useInfiniteCursor<Row>({
        axiosInstance: axios.instance,
        endpoint: "/rows",
        queryKey: "rows",
        initialLimit: 3,
      }),
    { wrapper: createWrapper() }
  );

describe("useInfiniteCursor", () => {
  it("loads the first page", async () => {
    const axios = server();

    const { result } = setup(axios);

    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.total).toBe(0);
    expect(axios.get).toHaveBeenCalledWith("/rows?limit=3");
  });

  it("fetches the next page when the same query is asked for again", async () => {
    const axios = server();
    const { result } = setup(axios);
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => result.current.onQueryChange("limit=3&offset=3"));

    await waitFor(() =>
      expect(result.current.data.map((r) => r.id)).toEqual([1, 2, 3, 4, 5])
    );
    expect(result.current.hasMore).toBe(false);
    expect(axios.get).toHaveBeenLastCalledWith("/rows?limit=3&cursor=p2");
  });

  it("starts over when the query changes, dropping any offset", async () => {
    const axios = server();
    const { result } = setup(axios);
    await waitFor(() => expect(result.current.data).toHaveLength(3));

    act(() => result.current.onQueryChange("limit=3&offset=0&sort=name"));

    await waitFor(() =>
      expect(axios.get).toHaveBeenLastCalledWith("/rows?limit=3&sort=name")
    );
  });

  it("asks for the next page once while it's loading", async () => {
    let release!: () => void;
    const pages = server();
    const get = vi.fn(async (url: string) => {
      // The second page waits until the test releases it.
      if (url.includes("cursor="))
        await new Promise<void>((resolve) => (release = resolve));
      return pages.get(url);
    });
    const { result } = setup({ instance: { get } as unknown as AxiosInstance });
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    act(() => result.current.onQueryChange("limit=3&offset=3"));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));

    // Scroll events keep asking while the next page is still loading.
    act(() => result.current.onQueryChange("limit=3&offset=3"));
    act(() => release());

    await waitFor(() => expect(result.current.data).toHaveLength(5));
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("asks for the next page once when asked twice in one tick", async () => {
    const axios = server();
    const { result } = setup(axios);
    await waitFor(() => expect(result.current.data).toHaveLength(3));
    const calls = axios.get.mock.calls.length;

    // No re-render between the two calls, so neither sees the other's request.
    act(() => {
      result.current.onQueryChange("limit=3&offset=3");
      result.current.onQueryChange("limit=3&offset=3");
    });

    await waitFor(() => expect(result.current.data).toHaveLength(5));
    expect(axios.get).toHaveBeenCalledTimes(calls + 1);
  });
});
