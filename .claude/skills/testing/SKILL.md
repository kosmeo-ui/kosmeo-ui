---
name: testing
description: How to write tests for @kosmeo-ui/react (packages/react) — Vitest, React Testing Library, user-event and jest-dom on jsdom; where tests live, queries and assertions, harnesses for controlled components, testing hooks with createWrapper and mockAxios, server-render and hydration checks, fake timers, choosing cases, and proving a test can fail. Use when adding, writing, reviewing or fixing a test or a .test.ts or .test.tsx file in packages/react — testing a component, hook or util, faking an API response, or when a test is flaky, hangs, cannot find an element, or turns up a bug.
paths:
  - packages/react/**/__tests__/**
  - packages/react/vitest.*
---

# Testing @kosmeo-ui/react

The suite is Vitest + React Testing Library + `@testing-library/user-event` +
`@testing-library/jest-dom`, on jsdom. Run it with:

```bash
npm test                                      # whole suite (Nx), from the repo root
npx vitest run src/components/inputs/select   # one folder, from packages/react
npm run test:watch -w @kosmeo-ui/react        # watch mode
```

Use Node 22 (`nvm use`): `.npmrc` sets `engine-strict=true`, so `npm install` fails with
`notsup` on any other version.

A util test needs only this file. Before writing a component or hook test, read
[references/examples.md](references/examples.md) — worked examples from the real suite.

## Rules for every test

1. **Arrange, act, assert, once each**, separated by blank lines. No assertion before
   the act, and no second act after an assertion — split into two tests or an
   `it.each` table. A precondition is what must already hold for the act to mean
   anything, e.g. the button is disabled before a test that clicks it. MUST NOT assert
   it mid-test: if it fails, the report names the wrong behaviour and the real check
   never runs. If it is a behaviour in its own right, give it its own test ("is
   disabled when the disabled prop is set" beside "does not call onClick when
   disabled"); if not, leave the assertion out.
2. **A pure call with no setup goes inline in the assertion:**
   `expect(pageRange(5, 10)).toEqual([…])`, not via a `result` variable.
3. **Import what you use from `"vitest"`** (`describe`, `it`, `expect`, `vi`, …) and
   nothing else. There are no globals, and an unused import fails lint.
4. **Fake the boundary, not our modules.** MUST NOT `vi.mock` a library module, hook or
   component, and render real child components. The boundary is what an app hands in:
   a data hook gets a fake `AxiosInstance` from `mockAxios` and a real React Query
   client from `createWrapper` (see "Hooks"). A browser API jsdom lacks is stubbed with
   `vi.stubGlobal` and undone with `vi.unstubAllGlobals()` in `afterEach`.
5. **MUST NOT assert output that looks wrong** — not even to describe what the code
   does today. See "When a test finds a bug".
6. **Prove the test can fail.** Before calling a new test done, break the line it
   guards (remove a condition, swap an order), confirm the cases that depend on that
   line go red — in a table, every row it affects and no unrelated test — then restore
   it. Skip this for a case that already fails because it caught a bug; that failure
   is the proof. A test that stays green under the break is testing something else:
   fix the test (a debounce or a pending request is the usual culprit — the act lands
   before the code under test runs). Keep the original in memory or in a backup path
   no one else uses — parallel agents share the scratchpad, and a shared
   `backup.tsx` has restored one component's source over another's. Vitest prints
   `FAIL` lines to stderr, so a script reading results captures `2>&1`. A break whose
   only effect is an error thrown inside an event handler cannot go red: React and
   jsdom swallow it into the log. Say so, rather than writing a test that cannot fail.
   When a case is marked `it.fails`, run it once as `it` to see why it fails — a
   duplicate-key warning tripping the `console.error` guard counts as a failure too.
7. **An expected `console.error` is mocked:**
   `vi.spyOn(console, "error").mockImplementation(() => {})`. Any other
   `console.error` fails the test (see "What the config already does").
8. **A test is not done until "Finishing a test" has run** — whether or not you are
   committing.

## Rules for component tests

These apply whenever a test renders. A util test renders nothing and skips them.

1. **Query the way a user finds things.** `getByRole` (with `name`) first, then
   `getByLabelText`, then `getByText`. MUST NOT use `container.querySelector`,
   `firstElementChild`, `parentElement`, a `selector` option or test ids to find an
   element. The only exceptions:
   - the modal backdrop (`.k-modal-overlay`), a click target with no role by design;
   - the root of a purely presentational element whose classes or inline style are
     the contract and which has no role (Badge's `<span>`, a table's scroll container),
     reached with `.parentElement` from its text or from a child found by role — only
     to assert those classes or that style;
   - checks over the markup itself, such as collecting every `[id]` in server-rendered
     HTML (see "Server rendering and hydration").
2. **If an element cannot be found by role or label, fix the component**, not the
   query. An unnamed control is an accessibility bug: a `<label>` pointing at a `<div>`
   names nothing (MultiSelect needed `role="combobox"` and `aria-labelledby`), an
   icon-only button needs `aria-label`, and a field named only by its `placeholder` has
   no accessible name (Testing Library does not use it) — give it `aria-label`. A
   trigger named after its current choice ("25", "Descending") collides with that
   option; name it for what it controls ("Results per page: 25"). A mouse-only control
   hidden from assistive tech
   (`aria-hidden`, `tabIndex={-1}`, as MultiSelect's chip × buttons) still gets an
   `aria-label`, and is found with `getByLabelText("Remove Apple")`:
   `getByRole(…, { name, hidden: true })` cannot match it, because Testing Library
   computes an `aria-hidden` element's name as empty.
3. **Presence is `toBeVisible()`; absence is `queryBy…` + `not.toBeInTheDocument()`.**
   `not.toBeVisible()` on a missing element throws, because `queryBy…` returned null.
4. **Use jest-dom matchers**, not DOM properties: `toBeDisabled`, `toBeChecked`,
   `toHaveAttribute`, `toHaveValue`, `toHaveAccessibleName`, `toBeRequired`,
   `toHaveFocus`. `expect(getBy…).toBeTruthy()` asserts nothing — `getBy…` already
   throws.
5. **`const user = userEvent.setup()` at the top of each interactive test**, then
   `await user.click(...)`. Never `fireEvent`, and never the bare `userEvent.click`.
   Import it as `import { userEvent } from "@testing-library/user-event"` — the default
   import is mistyped under `moduleResolution: "NodeNext"`. Events no user-event API
   can produce are dispatched by hand inside `act`, with a comment saying why: a
   `StorageEvent` from another tab, a `scroll` after stubbing layout, a `drop` (see
   "Things that look wrong but are not").
6. **Classes are asserted only where the class is the component's contract** (a
   `variant` or `size` prop mapping to `k-button-danger`), and then with
   `toHaveClass("a b c", { exact: true })` — order-independent. Never compare
   `className` strings.
7. **A controlled component is rendered from a small harness** that owns its state,
   the way a real parent does, so the test asserts what the user sees (the box is
   checked) instead of reading a change event out of a mock.

## Where tests live

In a `__tests__/` folder inside the component's or hook's folder, named after the unit,
importing it relatively with the full `.js` extension (ESM, `NodeNext`):

```
src/components/buttons/button/__tests__/button.test.tsx     import Button from "../index.js";
src/components/navigation/pagination/__tests__/utils.test.ts import { pageRange } from "../utils.js";
src/hooks/__tests__/usePaginated.test.ts                    import usePaginated from "../usePaginated.js";
```

`.test.ts` for plain functions, `.test.tsx` when the file contains JSX. Shared helpers
sit beside the tests that use them and are not named `.test.*`
(`hooks/__tests__/queryWrapper.tsx`, `components/inputs/__tests__/hydration.tsx`).
`__tests__/` is excluded from the build, `dist/` and the published tarball, and
type-checked by `tsconfig.spec.json`.

A util test in full:

```ts
import { describe, expect, it } from "vitest";
import { pageRange } from "../utils.js";

describe("pageRange", () => {
  it.each([
    [1, [1, 2, 3, 4, 5, "end-gap", 10]],
    [5, [1, "start-gap", 4, 5, 6, "end-gap", 10]],
    [10, [1, "start-gap", 6, 7, 8, 9, 10]],
  ])("places the gaps for page %i of 10", (page, expected) => {
    expect(pageRange(page, 10)).toEqual(expected);
  });
});
```

Import order is whatever `sort-imports` produces (longest line first) — never hand-order
it.

## What the config already does

`packages/react/vitest.config.ts` and `vitest.setup.ts` handle these for every file.
MUST NOT repeat them per test:

| setting | effect |
| --- | --- |
| `environment: "jsdom"` | no `// @vitest-environment` pragma |
| `pool: "vmThreads"` | each file gets its own module registry and DOM |
| `restoreMocks: true` | `vi.spyOn` spies are restored after each test |
| `setupFiles` → `vitest.setup.ts` | jest-dom matchers; Testing Library `cleanup()` and `localStorage.clear()` after each test; stubs for `scrollIntoView` and `Range` measurements, which jsdom lacks |
| `console.error` guard | any `console.error` a test has not mocked fails that test, so React warnings (a controlled field with no `onChange`, a hydration mismatch, nested buttons) cannot pile up unnoticed |

CSS is not loaded: `import "./styles.css"` is a no-op under Vitest, so `toBeVisible`
sees only `hidden`, inline styles and detached nodes, never class-based `display`.
`toHaveStyle` compares against `getComputedStyle`, where jsdom turns `rem` into `px`
(`20rem` reads as `320px`) and drops `vh`; pass a value in `px` or `%` when the test
is about passing a style through.

**The suite relies on per-file isolation.** MUST NOT run it with `--no-isolate` or a
shared environment: a file using fake timers leaves React's scheduler holding the
faked timers, and cleanup stops working in whichever file runs next.

## Hooks

- **`renderHook`** for a hook that returns values; act on it with
  `act(() => result.current.setPage(2))`. A hook that needs DOM (`useFocusTrap`,
  `useOutsideClick`, `useListKeyboard`) gets a tiny harness component that renders the
  elements it works on, and the test drives that harness with `user`.
- **Data hooks** (`usePaginated`, `useInfinite`, `useInfiniteCursor`) use
  `hooks/__tests__/queryWrapper.tsx`:
  - `createWrapper()` — a fresh `QueryClient` with retries off, as `renderHook`'s
    `wrapper`.
  - `mockAxios(respond)` — an `AxiosInstance` whose `get` returns `{ data: respond(url,
    config) }`; `respond` builds the page from the requested `limit`, `offset` or
    `cursor`, like the real endpoint. Assert requests on the returned `get` spy.
  - **A request that waits** — for loading states and in-flight behaviour: a `get` that
    awaits a promise the test resolves (`let release!: () => void` …
    `act(() => release())`). See the examples.
- Wait for results with `waitFor`, then assert synchronously.

## Server rendering and hydration

Every component is `"use client"` but is still server-rendered by Next.js, so a
component that reads `window`, generates ids or depends on a third-party editor gets a
hydration test — a row in `components/inputs/__tests__/generatedIds.test.tsx` for an
input with a generated id, otherwise in the component's own test file. Use
`components/inputs/__tests__/hydration.tsx`:

- `serverRender(element)` — `renderToString` into a container attached to the
  document; torn down after the test.
- `hydrate(container, element)` — hydrates it and returns `consoleError` and
  `onRecoverableError` spies. **React 19 reports an attribute mismatch only through
  `console.error`** and keeps the server's attribute in the DOM, so assert both are
  not called; comparing the DOM alone passes a mismatch.

## Things that look wrong but are not

- **Fake timers** — `vi.useFakeTimers({ shouldAdvanceTime: true })` in `beforeEach`,
  `vi.useRealTimers()` in `afterEach`, `userEvent.setup({ advanceTimers:
  vi.advanceTimersByTime })`, and advance with
  `await act(() => vi.advanceTimersByTimeAsync(ms))`. Without `shouldAdvanceTime`
  every user-event call hangs: Testing Library waits on a real `setTimeout(0)` and only
  fast-forwards it under Jest.
- **A cancelled checkbox click** — jsdom toggles the box back instead of restoring it,
  so after `preventDefault` it can read as checked. Assert the cancellation (the click
  handler saw `defaultPrevented`) and that `onChange` was not called, not the checked
  state.
- **Portals** — `Modal`, `Tooltip`, Typeahead's and SearchList's lists render into
  `document.body`; `screen` finds them, `within(container)` does not.
- **Positioning** — jsdom has no layout, so every `getBoundingClientRect()` is zeros.
  `useFloatingPosition` tests stub it per element, and set `window.innerWidth` /
  `innerHeight` in `beforeEach` and restore them in `afterEach`.
- **`IntersectionObserver`** does not exist in jsdom. Stub it with `vi.stubGlobal`,
  keep the callback, and call it inside `act` to simulate reaching the end of a list.
- **Accessible names** — the required asterisk is `aria-hidden`, so a required field's
  accessible name (`getByRole(…, { name })`) has no `*`, but `getByLabelText` matches
  the label's text content, which does: use `/^Attachments/`. jsdom's name computation
  drops a leading space in an inline child, so `"Access (required)"` computes as
  `"Access(required)"`; match it with `/^Access ?\(required\)$/`.
- **Implicit roles worth knowing** — `<address>` is `group`, `<dt>`/`<dd>` are
  `term`/`definition`, `<input type="file">` has no role (use its label).
- **Uploads** — `await user.upload(input, files)`. `applyAccept` is on by default, so a
  test of a wrong-type file the picker would let through needs
  `userEvent.setup({ applyAccept: false })`. An empty pick (`[]`) does nothing unless
  the input already holds files. **`toEqual` treats any two `File`s as equal**, whatever
  their names or contents — match by name:
  `expect(onSelect).toHaveBeenCalledWith(names.map((name) => expect.objectContaining({ name })))`.
- **Drag and drop** — user-event cannot drag, and jsdom has no `DataTransfer`. Dispatch
  the drop inside `act` with the shape the handler reads:
  `Object.assign(new Event("drop", { bubbles: true }), { dataTransfer: { files } })`.
- **Inputs user-event cannot drive** (`type="color"`, `type="range"`) — set the value
  with the native setter and dispatch `input` inside `act`, in a named helper with a
  comment (`pickColor`), since React ignores a plain `el.value = …`.
- **Scroll handlers** — jsdom has no layout, so stub `scrollHeight`, `clientHeight` and
  `scrollTop` on the element with `Object.defineProperty`, then
  `act(() => el.dispatchEvent(new Event("scroll")))`. Test the threshold one pixel
  either side.
- **Clipboard** — `userEvent.setup()` installs a clipboard stub: read what was copied
  with `await navigator.clipboard.readText()`, and fake a refusal with
  `vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(…)`.
- **Links** — clicking an `<a href="/path">` makes jsdom log "Not implemented:
  navigation", which the `console.error` guard fails. Use `href="#…"` when the test is
  about the click handler.
- **TipTap (RichTextEditor)** — the editor is created after mount, so wait for the
  toolbar to enable (`waitFor`) before acting on it.

## Choosing cases

Pick cases from the code's shape, not from typical inputs:

- **One case per branch** — every `if`, early return and lookup entry.
- **Both sides of every boundary, at every threshold** — the last value before it and
  the first after (`pageRange` with 7 pages, where all fit, and 8, where a gap appears).
  A function with several thresholds needs the pair at each one.
- **One step past the end of any lookup table or list** — the input that matches no
  entry or indexes beyond it (a page past the last; a highlight past a shorter list).
- **Only inputs real callers can produce.** Check the call sites and where their values
  come from — a prop an app passes, a browser API, an API response. A field typed
  `string` can hold anything, so the type does not define the range. If a caller *can*
  pass it, it is a case.
- **Timing-dependent behaviour** (debounces, pending requests, the first render before
  an effect) gets a case that acts while the work is still in flight — that is where
  this library's bugs have been.

## Dates and time zones

Build expected values with local-time constructors (`new Date(2024, 0, 5, 23, 30)`)
and local getters, so a test passes in any zone — as the `dateInput` util tests do.
Do not stub `TZ`: the suite runs in threads that share one process, and that is not
verified to isolate. A case about a specific zone needs a forks-pool config first.

## Naming and tables

- Name a test for the behaviour a user sees: `"keeps focus in the search box when an
  option is clicked"`, not `"calls preventDefault on mousedown"`.
- Several inputs with the same act and assertion are one `it.each` table, not several
  `expect`s in one test.
- Use `%s` in a table title for ordinary strings. Use `%j` when a case is an empty
  string or has whitespace that matters to the case, so it stays visible in the output.

## When a test finds a bug

A test that fails against current code because the code is wrong is the suite working.

1. **Assert the correct output**, never the current wrong one.
2. **Fix the bug**, test-first: the test is red, the fix turns it green. Keep the fix to
   the bug; anything else noticed on the way is reported, not fixed.
3. **Commit the fix separately**, as `fix(react): …` with its own version plan
   (`npm run version-plan`), so it can be reviewed and reverted on its own. If the test
   commit lands first, mark the failing case `it.fails` (`it.fails.each` for table
   rows) with a comment naming the bug, and switch it back to `it` in the fix commit,
   so every commit stays green.
4. **If the correct output is a judgement call**, do not pick one: record it as
   `it.todo('decide … — currently …')` with the input and current output, and ask.

## Finishing a test

Run these on every test file you wrote, in this order, whether or not you are
committing — from the repo root, with Node 22:

```bash
npx prettier --write <file>
npm run sort-imports -- <file>
npx eslint <file>
npx tsc -p packages/react/tsconfig.spec.json
npm test
```

Prettier MUST run before `sort-imports`: it can wrap an import over several lines,
which changes where it sorts. `tsc` must print nothing, and the whole suite must pass,
not only the new file — except a case marked `it.fails` for a bug awaiting its fix.
When the change also touches production code, run `npm run check` and
`npm run lint`, and add a version plan.
