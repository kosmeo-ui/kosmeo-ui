import type { InfiniteScrollMenu } from "../../components/data-display/infiniteScroll/types.js";
import InfiniteScroll from "../../components/data-display/infiniteScroll/index.js";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import useInfiniteArchivableCursor from "../useInfiniteArchivableCursor.js";
import { api, createWrapper, serve } from "./queryWrapper.js";
import type { UseInfiniteReturn } from "../useInfinite.js";
import useInfiniteCursor from "../useInfiniteCursor.js";
import { describe, expect, it } from "vitest";
import useInfinite from "../useInfinite.js";
import type { AxiosInstance } from "axios";

type Person = { id: number; name: string };

const ada = [{ id: 1, name: "Ada" }];
const offsetPage = () => ({ data: ada, total: 1, hasMore: false });
const cursorPage = () => ({
  data: ada,
  hasMore: false,
  limit: 25,
  nextCursor: null,
});

const hooks: [
  string,
  () => unknown,
  (axios: AxiosInstance, enabled?: boolean) => UseInfiniteReturn<Person>,
  string,
][] = [
  [
    "useInfinite",
    offsetPage,
    (axios) =>
      useInfinite<Person>({
        axiosInstance: axios,
        endpoint: "/people",
        queryKey: "people",
      }),
    "?limit=25&offset=0",
  ],
  [
    "useInfiniteCursor",
    cursorPage,
    (axios, enabled) =>
      useInfiniteCursor<Person>({
        axiosInstance: axios,
        endpoint: "/people",
        queryKey: "people",
        enabled,
      }),
    "?limit=25",
  ],
  [
    "useInfiniteArchivableCursor",
    cursorPage,
    (axios, enabled) =>
      useInfiniteArchivableCursor<Person>({
        axiosInstance: axios,
        endpoint: "/people",
        queryKey: "people",
        enabled,
      }),
    "?limit=25",
  ],
];

const sortedAndFiltered: InfiniteScrollMenu = {
  title: "People",
  filters: [
    {
      type: "SELECT",
      title: "Status",
      dataKey: "status",
      options: [
        { id: "active", name: "Active", selected: true },
        { id: "closed", name: "Closed", selected: false },
      ],
    },
  ],
  sort: {
    sortDataKeys: [{ dataKey: "name", displayName: "Name", selected: true }],
    sortDirection: "asc",
  },
};

/** Renders the list the way an app does: the hook feeding InfiniteScroll. */
const renderList = (
  useList: (axios: AxiosInstance) => UseInfiniteReturn<Person>,
  menu: InfiniteScrollMenu
) => {
  const axios = api();
  const List = () => {
    const list = useList(axios);
    return (
      <InfiniteScroll<Person>
        menu={menu}
        columns={[{ title: "Name", dataKey: "name" }]}
        data={list.data}
        hasMore={list.hasMore}
        isLoading={list.isLoading}
        onQueryChange={list.onQueryChange}
        onReload={list.reload}
      />
    );
  };
  const Wrapper = createWrapper();
  render(
    <Wrapper>
      <List />
    </Wrapper>
  );
};

describe.each(hooks)("%s", (_, respond, useList, defaultSearch) => {
  it("requests once on mount, with the menu's default sort and filter", async () => {
    const requests = serve("/people", respond);

    renderList(useList, sortedAndFiltered);

    await screen.findByRole("cell", { name: "Ada" });
    expect(
      requests.map((url) => [
        url.searchParams.get("sort"),
        url.searchParams.get("filter[status]"),
      ])
    ).toEqual([["name", "active"]]);
  });

  it("requests once on mount when the menu has no default sort or filter", async () => {
    const requests = serve("/people", respond);

    renderList(useList, { title: "People" });

    await screen.findByRole("cell", { name: "Ada" });
    expect(requests.map((url) => url.search)).toEqual([defaultSearch]);
  });

  it("requests its default page once when nothing calls onQueryChange", async () => {
    const requests = serve("/people", respond);

    const { result } = renderHook(() => useList(api()), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(requests.map((url) => url.search)).toEqual([defaultSearch]);
  });

  it("is loading from its first render", async () => {
    serve("/people", respond);
    const loading: boolean[] = [];

    const { result } = renderHook(
      () => {
        const list = useList(api());
        loading.push(list.isLoading);
        return list;
      },
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(loading[0]).toBe(true);
  });
});

describe.each(hooks.slice(1))("%s, disabled", (_, __, useList) => {
  it("is not loading from its first render", () => {
    const loading: boolean[] = [];

    renderHook(
      () => {
        const list = useList(api(), false);
        loading.push(list.isLoading);
        return list;
      },
      { wrapper: createWrapper() }
    );

    expect(loading).not.toContain(true);
  });
});
