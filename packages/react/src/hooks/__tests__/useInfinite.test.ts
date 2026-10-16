import { act, renderHook, waitFor } from "@testing-library/react";
import { createWrapper, mockAxios } from "./queryWrapper.js";
import { describe, expect, it } from "vitest";
import useInfinite from "../useInfinite.js";

type Row = { id: number };

/** 5 rows served by limit/offset. */
const server = () =>
  mockAxios((url) => {
    const params = new URL(url, "http://x").searchParams;
    const limit = Number(params.get("limit"));
    const offset = Number(params.get("offset"));
    const rows = [1, 2, 3, 4, 5].map((id) => ({ id }));
    return {
      data: rows.slice(offset, offset + limit),
      total: rows.length,
      hasMore: offset + limit < rows.length,
    };
  });

const setup = (axios = server()) =>
  renderHook(
    () =>
      useInfinite<Row>({
        axiosInstance: axios.instance,
        endpoint: "/rows",
        queryKey: "rows",
        initialLimit: 2,
      }),
    { wrapper: createWrapper() }
  );

const ids = (rows: Row[]) => rows.map((r) => r.id);

describe("useInfinite", () => {
  it("loads the first page with the total", async () => {
    const { result } = setup();
    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2]));
    expect(result.current.total).toBe(5);
    expect(result.current.hasMore).toBe(true);
  });

  it("appends later pages", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.onQueryChange("limit=2&offset=2"));
    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2, 3, 4]));

    act(() => result.current.onQueryChange("limit=2&offset=4"));
    await waitFor(() =>
      expect(ids(result.current.data)).toEqual([1, 2, 3, 4, 5])
    );
    expect(result.current.hasMore).toBe(false);
  });

  it("replaces the data for a new query at offset 0", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    act(() => result.current.onQueryChange("limit=2&offset=2"));
    await waitFor(() => expect(result.current.data).toHaveLength(4));

    act(() => result.current.onQueryChange("limit=3&offset=0"));
    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2, 3]));
  });

  it("reloads from offset 0", async () => {
    const axios = server();
    const { result } = setup(axios);
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    act(() => result.current.onQueryChange("limit=2&offset=2"));
    await waitFor(() => expect(result.current.data).toHaveLength(4));

    act(() => result.current.reload());
    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2]));
    expect(axios.get).toHaveBeenLastCalledWith("/rows?limit=2&offset=0");
  });

  it("drops rows a later page repeats", async () => {
    // The second page repeats id 2, as when rows shift between requests.
    const axios = mockAxios((url) => {
      const offset = Number(
        new URL(url, "http://x").searchParams.get("offset")
      );
      return offset === 0
        ? { data: [{ id: 1 }, { id: 2 }], total: 3, hasMore: true }
        : { data: [{ id: 2 }, { id: 3 }], total: 3, hasMore: false };
    });
    const { result } = setup(axios);
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.onQueryChange("limit=2&offset=2"));
    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2, 3]));
  });
});
