import { act, renderHook, waitFor } from "@testing-library/react";
import { createWrapper, mockAxios } from "./queryWrapper.js";
import usePaginated from "../usePaginated.js";
import { describe, expect, it } from "vitest";

type Row = { id: number };

/** 23 rows, served `limit` at a time from `offset`. */
const server = (total = 23) =>
  mockAxios((_url, config) => {
    const { limit, offset } = (config as { params: Record<string, number> })
      .params;
    const rows = Array.from({ length: total }, (_, i) => ({ id: i + 1 }));
    return { data: rows.slice(offset, offset + limit), total };
  });

const setup = (params?: Record<string, string>, axios = server()) =>
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

describe("usePaginated", () => {
  it("loads the first page", async () => {
    const { result } = setup();
    expect(result.current.isLoading).toBe(true);

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
    expect(result.current.page).toBe(2);

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
});
