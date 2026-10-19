import { act, renderHook, waitFor } from "@testing-library/react";
import { api, createWrapper, serve } from "./queryWrapper.js";
import usePaginated from "../usePaginated.js";
import { describe, expect, it } from "vitest";
import { HttpResponse } from "msw";

type Row = { id: number };

/** The page of `total` rows that `url`'s limit and offset ask for. */
const page = (url: URL, total = 23) => {
  const limit = Number(url.searchParams.get("limit"));
  const offset = Number(url.searchParams.get("offset"));
  const rows = Array.from({ length: total }, (_, i) => ({ id: i + 1 }));
  return { data: rows.slice(offset, offset + limit), total };
};

const setup = (params?: Record<string, string>) =>
  renderHook(
    ({ params }) =>
      usePaginated<Row>({
        axiosInstance: api(),
        endpoint: "/rows",
        queryKey: "rows",
        params,
      }),
    { wrapper: createWrapper(), initialProps: { params } }
  );

/** Serves 23 rows; every page after the first waits for `release()`. */
const serveDeferred = () => {
  let release!: () => void;
  serve("/rows", async (url) => {
    if (Number(url.searchParams.get("offset")) > 0)
      await new Promise<void>((resolve) => (release = resolve));
    return page(url);
  });
  return { release: () => release() };
};

describe("usePaginated", () => {
  it("is loading until the first page arrives", () => {
    serve("/rows", (url) => page(url));

    const { result } = setup();

    expect(result.current.isLoading).toBe(true);
  });

  it("loads the first page", async () => {
    serve("/rows", (url) => page(url));

    const { result } = setup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.map((r) => r.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(result.current.total).toBe(23);
    expect(result.current.pageCount).toBe(3);
  });

  it("requests limit and offset with the extra params", async () => {
    const requests = serve("/rows", (url) => page(url));
    const { result } = setup({ sort: "name" });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPage(3));

    await waitFor(() => expect(result.current.data[0]?.id).toBe(21));
    expect(requests.at(-1)?.search).toBe("?sort=name&limit=10&offset=20");
  });

  it("returns to page 1 when the page size changes", async () => {
    serve("/rows", (url) => page(url));
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));

    act(() => result.current.setPageSize(5));

    expect(result.current.page).toBe(1);
    await waitFor(() => expect(result.current.data).toHaveLength(5));
    expect(result.current.pageCount).toBe(5);
  });

  it("returns to page 1 when the params change", async () => {
    serve("/rows", (url) => page(url));
    const { result, rerender } = setup({ q: "a" });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));

    rerender({ params: { q: "b" } });

    expect(result.current.page).toBe(1);
  });

  it("steps back when the current page no longer exists", async () => {
    let total = 23;
    serve("/rows", (url) => page(url, total));
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.data[0]?.id).toBe(21));
    total = 15;

    act(() => result.current.refetch());

    await waitFor(() => expect(result.current.page).toBe(2));
  });

  it.each([
    [
      "an error status",
      () => HttpResponse.json(null, { status: 500 }),
      "Request failed with status code 500",
    ],
    ["a network failure", () => HttpResponse.error(), "Network Error"],
  ])("surfaces %s", async (_, respond, message) => {
    serve("/rows", respond);

    const { result } = setup();

    await waitFor(() => expect(result.current.error?.message).toBe(message));
    expect(result.current.data).toEqual([]);
    expect(result.current.pageCount).toBe(1);
  });

  it("keeps the previous page on screen while the next one loads", async () => {
    serveDeferred();
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data[0]?.id).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("shows the next page once it arrives", async () => {
    const server = serveDeferred();
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    act(() => server.release());

    await waitFor(() => expect(result.current.data[0]?.id).toBe(11));
  });
});
