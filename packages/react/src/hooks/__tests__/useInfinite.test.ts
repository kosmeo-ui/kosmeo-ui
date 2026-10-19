import { act, renderHook, waitFor } from "@testing-library/react";
import { api, createWrapper, serve } from "./queryWrapper.js";
import { describe, expect, it } from "vitest";
import useInfinite from "../useInfinite.js";
import { HttpResponse } from "msw";

type Row = { id: number };

/** 5 rows served by limit/offset. */
const fiveRows = (url: URL) => {
  const limit = Number(url.searchParams.get("limit"));
  const offset = Number(url.searchParams.get("offset"));
  const rows = [1, 2, 3, 4, 5].map((id) => ({ id }));
  return {
    data: rows.slice(offset, offset + limit),
    total: rows.length,
    hasMore: offset + limit < rows.length,
  };
};

const setup = (respond: (url: URL) => unknown = fiveRows) => {
  const requests = serve("/rows", respond);
  const hook = renderHook(
    () =>
      useInfinite<Row>({
        axiosInstance: api(),
        endpoint: "/rows",
        queryKey: "rows",
        initialLimit: 2,
      }),
    { wrapper: createWrapper() }
  );
  return { ...hook, requests };
};

const ids = (rows: Row[]) => rows.map((r) => r.id);

describe("useInfinite", () => {
  it("loads the first page with the total", async () => {
    const { result } = setup();

    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2]));
    expect(result.current.total).toBe(5);
    expect(result.current.hasMore).toBe(true);
  });

  it("appends the next page", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.onQueryChange("limit=2&offset=2"));

    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2, 3, 4]));
  });

  it("appends the last page and reports there are no more", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    act(() => result.current.onQueryChange("limit=2&offset=2"));
    await waitFor(() => expect(result.current.data).toHaveLength(4));

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
    const { result, requests } = setup();
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    act(() => result.current.onQueryChange("limit=2&offset=2"));
    await waitFor(() => expect(result.current.data).toHaveLength(4));

    act(() => result.current.reload());

    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2]));
    expect(requests.at(-1)?.search).toBe("?limit=2&offset=0");
  });

  it("drops rows a later page repeats", async () => {
    // The second page repeats id 2, as when rows shift between requests.
    const { result } = setup((url) =>
      url.searchParams.get("offset") === "0"
        ? { data: [{ id: 1 }, { id: 2 }], total: 3, hasMore: true }
        : { data: [{ id: 2 }, { id: 3 }], total: 3, hasMore: false }
    );
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    act(() => result.current.onQueryChange("limit=2&offset=2"));

    await waitFor(() => expect(ids(result.current.data)).toEqual([1, 2, 3]));
  });

  describe("when a request fails", () => {
    it.each([
      [
        "an error status",
        () => HttpResponse.json(null, { status: 500 }),
        "Request failed with status code 500",
      ],
      ["a network failure", () => HttpResponse.error(), "Network Error"],
    ])("reports %s as its error", async (_, respond, message) => {
      const { result } = setup(respond);

      await waitFor(() => expect(result.current.error?.message).toBe(message));
    });

    it("offers no more pages after a failed first page", async () => {
      const { result } = setup(() => HttpResponse.json(null, { status: 500 }));

      await waitFor(() => expect(result.current.error).not.toBeNull());
      expect(result.current.hasMore).toBe(false);
    });

    it("keeps its rows and offers no more pages after a failed next page", async () => {
      const { result } = setup((url) =>
        url.searchParams.get("offset") === "2"
          ? HttpResponse.json(null, { status: 500 })
          : fiveRows(url)
      );
      await waitFor(() => expect(result.current.data).toHaveLength(2));

      act(() => result.current.onQueryChange("limit=2&offset=2"));

      await waitFor(() => expect(result.current.error).not.toBeNull());
      expect(result.current.data).toHaveLength(2);
      expect(result.current.hasMore).toBe(false);
    });

    it("clears the error once a reload succeeds", async () => {
      let failing = true;
      const { result } = setup((url) =>
        failing ? HttpResponse.json(null, { status: 500 }) : fiveRows(url)
      );
      await waitFor(() => expect(result.current.error).not.toBeNull());
      failing = false;

      act(() => result.current.reload());

      await waitFor(() => expect(result.current.data).toHaveLength(2));
      expect(result.current.error).toBeNull();
    });
  });
});
