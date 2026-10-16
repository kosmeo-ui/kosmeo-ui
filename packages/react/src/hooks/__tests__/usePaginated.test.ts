import { act, renderHook, waitFor } from "@testing-library/react";
import { createWrapper, mockAxios } from "./queryWrapper.js";
import { describe, expect, it, vi } from "vitest";
import usePaginated from "../usePaginated.js";
import type { AxiosInstance } from "axios";

type Row = { id: number };

/** 23 rows, served `limit` at a time from `offset`. */
const server = (total = 23) =>
  mockAxios((_url, config) => {
    const { limit, offset } = (config as { params: Record<string, number> })
      .params;
    const rows = Array.from({ length: total }, (_, i) => ({ id: i + 1 }));
    return { data: rows.slice(offset, offset + limit), total };
  });

const setup = (
  params?: Record<string, string>,
  axios: { instance: AxiosInstance } = server()
) =>
  renderHook(
    ({ params }) =>
      usePaginated<Row>({
        axiosInstance: axios.instance,
        endpoint: "/rows",
        queryKey: "rows",
        params,
      }),
    { wrapper: createWrapper(), initialProps: { params } }
  );

/** Serves 23 rows; every page after the first waits for `release()`. */
const deferredServer = () => {
  let release!: () => void;
  const get = vi.fn(
    async (_url: string, config: { params: Record<string, number> }) => {
      if (config.params.offset > 0)
        await new Promise<void>((resolve) => (release = resolve));
      const rows = Array.from({ length: 23 }, (_, i) => ({ id: i + 1 }));
      const { limit, offset } = config.params;
      return {
        data: { data: rows.slice(offset, offset + limit), total: 23 },
      };
    }
  );
  return {
    instance: { get } as unknown as AxiosInstance,
    release: () => release(),
  };
};

describe("usePaginated", () => {
  it("is loading until the first page arrives", () => {
    const { result } = setup();

    expect(result.current.isLoading).toBe(true);
  });

  it("loads the first page", async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.map((r) => r.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(result.current.total).toBe(23);
    expect(result.current.pageCount).toBe(3);
  });

  it("requests limit and offset with the extra params", async () => {
    const axios = server();
    const { result } = setup({ sort: "name" }, axios);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPage(3));

    await waitFor(() => expect(result.current.data[0]?.id).toBe(21));
    expect(axios.get).toHaveBeenLastCalledWith("/rows", {
      params: { sort: "name", limit: 10, offset: 20 },
    });
  });

  it("returns to page 1 when the page size changes", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));

    act(() => result.current.setPageSize(5));

    expect(result.current.page).toBe(1);
    await waitFor(() => expect(result.current.data).toHaveLength(5));
    expect(result.current.pageCount).toBe(5);
  });

  it("returns to page 1 when the params change", async () => {
    const { result, rerender } = setup({ q: "a" });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));

    rerender({ params: { q: "b" } });

    expect(result.current.page).toBe(1);
  });

  it("steps back when the current page no longer exists", async () => {
    let total = 23;
    const axios = mockAxios((_url, config) => {
      const { limit, offset } = (config as { params: Record<string, number> })
        .params;
      const rows = Array.from({ length: total }, (_, i) => ({ id: i + 1 }));
      return { data: rows.slice(offset, offset + limit), total };
    });
    const { result } = setup(undefined, axios);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.data[0]?.id).toBe(21));
    total = 15;

    act(() => result.current.refetch());

    await waitFor(() => expect(result.current.page).toBe(2));
  });

  it("surfaces request errors", async () => {
    const axios = mockAxios(() => {
      throw new Error("boom");
    });

    const { result } = setup(undefined, axios);

    await waitFor(() => expect(result.current.error?.message).toBe("boom"));
    expect(result.current.data).toEqual([]);
    expect(result.current.pageCount).toBe(1);
  });

  it("keeps the previous page on screen while the next one loads", async () => {
    const { result } = setup(undefined, deferredServer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data[0]?.id).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("shows the next page once it arrives", async () => {
    const axios = deferredServer();
    const { result } = setup(undefined, axios);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    act(() => axios.release());

    await waitFor(() => expect(result.current.data[0]?.id).toBe(11));
  });
});
