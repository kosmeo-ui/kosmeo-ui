# Test examples

Taken from the real suite. Open the source file for the full version.

## Contents

- Util — `it.each` tables and boundaries
- Component — a controlled component through a harness
- Component — a cancelled click
- Component — a pointer drag
- Component — a mouse-only control
- Hook — a data hook against msw
- Hook — a request that waits
- Hydration — server render, then hydrate
- Fake timers — a debounced search
- A browser API jsdom lacks — `IntersectionObserver`
- Anti-patterns and their replacements

## Util — `it.each` tables and boundaries

`packages/react/src/components/navigation/pagination/__tests__/utils.test.ts`

```ts
it.each([
  [1, 7, [1, 2, 3, 4, 5, 6, 7]],
  [4, 3, [1, 2, 3]],
  [1, 0, []],
])("lists every page that fits: page %i of %i", (page, count, expected) => {
  expect(pageRange(page, count)).toEqual(expected);
});

it.each([
  [1, 8, [1, 2, 3, 4, 5, "end-gap", 8]],
  [1, 10, [1, 2, 3, 4, 5, "end-gap", 10]],
  [3, 10, [1, 2, 3, 4, 5, "end-gap", 10]],
])(
  "puts a single gap at the end near the first page: page %i of %i",
  (page, count, expected) => {
    expect(pageRange(page, count)).toEqual(expected);
  }
);
```

7 pages is the last count where every page fits; 8 is the first that needs a gap. The
boundary is the pair of rows, one table each side of it.

## Component — a controlled component through a harness

`packages/react/src/components/inputs/searchList/__tests__/searchList.test.tsx`

SearchList is controlled: the parent feeds the pick back as `value`. The harness plays
that parent, so closing after a pick behaves as it does in an app.

```tsx
const Harness = ({
  initialOptions,
  loading,
  onSelect,
}: {
  initialOptions?: City[];
  loading?: boolean;
  onSelect: (city: City | null, event?: React.MouseEvent) => void;
}) => {
  const [value, setValue] = useState<City | null>(null);
  return (
    <SearchList<City>
      id="city"
      label="City"
      labelKey="name"
      searchKey="name"
      queryFn={searchCities(loading)}
      value={value}
      onSelect={(city, event) => {
        setValue(city);
        onSelect(city, event);
      }}
      initialOptions={initialOptions}
    />
  );
};
```

## Component — a cancelled click

`packages/react/src/components/inputs/checkbox/__tests__/checkbox.test.tsx`

jsdom toggles a cancelled checkbox back instead of restoring it, so the read-only test
asserts the cancellation, not the checked state. "Does not call onChange" is its own
test beside it.

```tsx
it("cancels the click", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <Checkbox label="Agree" checked={false} readOnly onClick={onClick} />
  );

  await user.click(screen.getByRole("checkbox", { name: "Agree" }));

  expect(onClick).toHaveBeenCalledWith(
    expect.objectContaining({ defaultPrevented: true })
  );
});
```

## Component — a pointer drag

`packages/react/src/components/overlays/modal/__tests__/modal.test.tsx`

A press that starts inside the dialog and is released over the backdrop (a text
selection dragged out) must not close the modal. `user.pointer` presses, moves and
releases as separate steps; `fireEvent` would skip the browser's event sequence. The
backdrop is one of the skill's allowed `querySelector` exceptions.

```tsx
const overlay = () => document.querySelector(".k-modal-overlay")!;

it("ignores a drag that starts in the dialog and ends on the backdrop", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal show onClose={onClose}>
      Content
    </Modal>
  );

  await user.pointer([
    { keys: "[MouseLeft>]", target: screen.getByText("Content") },
    { target: overlay() },
    { keys: "[/MouseLeft]" },
  ]);

  expect(onClose).not.toHaveBeenCalled();
});
```

## Component — a mouse-only control

`packages/react/src/components/inputs/multiSelect/__tests__/multiSelect.test.tsx`

MultiSelect's chip × buttons are `aria-hidden` with `tabIndex={-1}` (a combobox cannot
contain controls; keyboard users deselect from the listbox). They keep an `aria-label`,
and are found by it — `getByRole(…, { hidden: true, name })` cannot match an
`aria-hidden` element's name.

```tsx
const removeButton = (name: string) => screen.getByLabelText(`Remove ${name}`);

// …
await user.click(removeButton("Apple"));

expect(onChange).toHaveBeenCalledWith([banana]);
```

## Hook — a data hook against msw

`packages/react/src/hooks/__tests__/usePaginated.test.ts`

`serve` answers GET `/rows` the way the real endpoint does, from the `limit` and
`offset` axios actually sent; `api()` is a real `AxiosInstance`.

```ts
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

it("requests limit and offset with the extra params", async () => {
  const requests = serve("/rows", (url) => page(url));
  const { result } = setup({ sort: "name" });
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => result.current.setPage(3));

  await waitFor(() => expect(result.current.data[0]?.id).toBe(21));
  expect(requests.at(-1)?.search).toBe("?sort=name&limit=10&offset=20");
});
```

The assertion is on the query string the server received, so it checks axios's
`params` serialization too — a hand-built fake `AxiosInstance` cannot.

Errors are responses too:

```ts
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
});
```

## Hook — a request that waits

Same file. Every page after the first waits until the test releases it, so the test can
act and assert while the request is in flight — where the "previous page stays on
screen" promise lives.

```ts
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

it("shows the next page once it arrives", async () => {
  const server = serveDeferred();
  const { result } = setup();
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  act(() => result.current.setPage(2));
  await waitFor(() => expect(result.current.isFetching).toBe(true));

  act(() => server.release());

  await waitFor(() => expect(result.current.data[0]?.id).toBe(11));
});
```

The `waitFor`s before the act are arrangement: they wait for the state the act needs.

## Hydration — server render, then hydrate

`packages/react/src/components/inputs/__tests__/generatedIds.test.tsx`, with the helpers
in `hydration.tsx` beside it.

```tsx
describe.each(fields)("%s server render", (_name, element) => {
  it("hydrates without a mismatch", async () => {
    const container = serverRender(element());

    const { consoleError, onRecoverableError } = await hydrate(
      container,
      element()
    );

    expect(consoleError).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  it("keeps the server's ids after hydration", async () => {
    const container = serverRender(element());
    const serverIds = ids(container);

    await hydrate(container, element());

    expect(ids(container)).toEqual(serverIds);
  });
});
```

`ids` collects every `[id]` in the container — a check over the markup itself, one of
the allowed `querySelector` exceptions.

## Fake timers — a debounced search

`packages/react/src/components/inputs/searchList/__tests__/searchList.test.tsx`

```tsx
type User = ReturnType<typeof userEvent.setup>;

/** Runs out SearchList's 500ms search debounce. */
const settle = () => act(() => vi.advanceTimersByTimeAsync(500));

/** Types a search and waits out the debounce, so its results show. */
const search = async (user: User, input: HTMLElement, text: string) => {
  await user.type(input, text);
  await settle();
};

// shouldAdvanceTime keeps the clock ticking for Testing Library's own
// setTimeout(0) waits, which it only fast-forwards under Jest.
beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

it("offers initial options in a listbox on focus", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const { input } = setup({ initialOptions: [cities[2]] });

  await user.click(input);

  const listbox = screen.getByRole("listbox", { name: "City" });
  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(input).toHaveAttribute("aria-controls", listbox.id);
});
```

A test about something the debounce delays (a stale result behind the spinner, a
highlight past a shorter list) MUST `settle()` before its assertions — acting before
the debounce fires is how a test passes against broken code.

## A browser API jsdom lacks — `IntersectionObserver`

`packages/react/src/components/inputs/typeahead/__tests__/typeahead.test.tsx`

The stub keeps the component's callback, so the test can say when the end of the list
scrolls into view.

```tsx
/** The callback of the observer watching the "Loading more" sentinel. */
let reachEnd: () => void;
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        reachEnd = () =>
          act(() =>
            callback(
              [{ isIntersecting: true } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver
            )
          );
      }
      observe() {}
      disconnect() {}
    }
  );
});
afterEach(() => vi.unstubAllGlobals());
```

## Anti-patterns and their replacements

| instead of | write |
| --- | --- |
| `await userEvent.click(el)` | `const user = userEvent.setup()` … `await user.click(el)` |
| `import userEvent from "@testing-library/user-event"` | `import { userEvent } from "@testing-library/user-event"` |
| `fireEvent.mouseDown(el)` | `await user.pointer({ keys: "[MouseLeft>]", target: el })` |
| `fireEvent.keyDown(input, { key: "Enter" })` | `await user.click(input)` … `await user.keyboard("{Enter}")` |
| `expect(getByRole("button")).toBeInTheDocument()` | `expect(getByRole("button")).toBeVisible()` |
| `expect(queryByText("x")).not.toBeVisible()` | `expect(queryByText("x")).not.toBeInTheDocument()` |
| `expect(button.className).toBe("k-button k-button-primary …")` | `expect(button).toHaveClass("k-button k-button-primary …", { exact: true })` |
| `getByText("Apple", { selector: ".k-chip" }).parentElement` | `within(screen.getByRole("combobox")).getByText("Apple")` |
| `container.querySelector("[contenteditable]")` | `screen.getByRole("textbox", { name: "Notes" })` |
| `vi.mock("../../../hooks/useListKeyboard.js")` | render the real hook through a harness |
| `vi.mock("axios")`, or `{ get: vi.fn() } as unknown as AxiosInstance` | `api()` plus `serve("/rows", (url) => page(url))`, asserting on the returned requests |
| `expect(isDisabled)` … click … `expect(onClick)` in one test | two tests: "is disabled", "does not call onClick when disabled" |
| asserting the current wrong output | assert the right output; fix the bug in its own `fix(react):` commit |
