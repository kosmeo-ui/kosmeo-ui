---
name: ui
description: Patterns for @kosmeo-ui/react (packages/react), the shared React component library. Use when creating or editing components, hooks, styles, theme tokens or exports in the library.
paths:
  - packages/react/**
---

# @kosmeo-ui/react Patterns

`@kosmeo-ui/react` (`packages/react`) is the shared React 19
component library: `k-` prefixed CSS classes, light/dark theming through CSS
variables and `data-theme` on `<html>`, `Variant`/`Size` prop conventions, and
FontAwesome icons. It has zero internal dependencies and is a released library.

Apps may be served under a base path. A plain `href` a component renders as an
`<a>` (`StatCard`, `Breadcrumbs`) is a full page load, so the app passes it
already prefixed with its own base path. Library components must not hard-code
absolute app paths.

See [examples.md](examples.md) for full code from the current library.

## Layout — `packages/react/`

```
package.json                # "type": "module"; exports "." and "./styles.css"
project.json                # Nx targets: build, check, clean
tsconfig.json               # moduleResolution "NodeNext", jsx "react-jsx"
scripts/copy-css.js         # Copies every .css from src/ to dist/ after tsc
src/
  index.ts                  # Re-exports components + hooks, and the shared types
  styles.css                # Reset, scrollbar, theme tokens (:root + [data-theme="dark"])
  css.d.ts                  # declare module "*.css"
  components/
    index.ts                # Flat barrel — the public component API
    types.ts                # Variant, Size, FlexAlign, FlexJustify, PropsWithVariant, PropsWithSize
    <bucket>/<name>/
      index.tsx             # Default export + exported `<Name>Props`
      styles.css            # Rules for this component, `k-` prefixed
  hooks/
    index.ts                # Hook barrel
    use<Name>.ts            # One hook per file, default export
```

Buckets: `layout/`, `forms/`, `inputs/`, `buttons/`, `overlays/`, `feedback/`,
`data-display/`, `navigation/`. Folder names are camelCase (`borderedSection/`,
`infiniteScroll/`).

## Editing components

- Each component folder holds `index.tsx` + `styles.css` (a few add `utils.ts` or
  sub-folders, e.g. `feedback/badge/utils.ts`, `data-display/infiniteScroll/`).
- `index.tsx` imports its stylesheet with `import "./styles.css";` and default
  exports the component. Export the props interface as `<Name>Props`.
- Relative imports are fully specified — `.js`, and `/index.js` for a folder.
  webpack (and so Next.js) can't resolve anything shorter in an ESM package, and
  `moduleResolution: "NodeNext"` makes `tsc` reject it.
  - Same bucket: `import Centered from "../centered/index.js";`
  - Cross bucket: `import Spinner from "../../feedback/spinner/index.js";`
  - Shared types: `import { PropsWithSize, PropsWithVariant } from "../../types.js";`
- Every component file starts with `"use client";`, so Next.js server components
  can render it.
  - Hooks: `import useFocusTrap from "../../../hooks/useFocusTrap";`
- Use `PropsWithVariant` / `PropsWithSize` for `variant` / `size` props, and map
  them to classes (`k-badge-${variant}`, `k-badge-${size}`) — never to inline
  styles.
- Build class lists as an array filtered with `Boolean` and joined, as `Page`
  does, or a template string for a fixed set.
- JSDoc each prop the name doesn't explain (`/** Fill parent height … */`).
- Imports follow the repo order: single-line imports longest → shortest, then
  multi-line imports by the length of their last line. `npm run sort-imports`
  fixes it.
- Internal building blocks that aren't exported: `forms/fieldShell` (label/error
  shell for Input, TextArea, Select, MultiSelect, DateInput), `forms/optionsGroup`
  (CheckboxGroup/RadioGroup shell), `forms/requiredAsterisk`,
  `inputs/dropdownArrowButton`. Reuse them inside the library rather than
  re-creating label or error markup.

## Exports

- Components: add to the flat barrel `src/components/index.ts` with the bucket
  path — `export { default as Foo } from "./<bucket>/foo";` — and its props type
  in the `export type { … }` block below. Consumers never see buckets.
- Hooks: add to `src/hooks/index.ts` (`export { default as useFoo } from "./useFoo";`).
- `src/index.ts` re-exports both barrels plus `Variant`, `Size`,
  `PropsWithVariant`, `PropsWithSize`. Touch it only for new shared types.
- Any new runtime import must be a declared dependency in `package.json`
  (`react-toastify` once resolved only through hoisting and broke the extracted
  build). `react`/`react-dom` are peers; `axios` is a dev dependency — hooks take
  the app's `AxiosInstance` as an argument.

Consumers:

```tsx
import { Button, Modal, InfiniteScroll, useInfiniteCursor } from "@kosmeo-ui/react";
import type { Variant, Size, InfiniteScrollMenu } from "@kosmeo-ui/react";
import "@kosmeo-ui/react/styles.css"; // once, in the app entry point
```

## Styling

**Inline styles are forbidden except as a last resort.** Every component gets a
class and a rule in its own `styles.css`:

- Inline `style={{ … }}` can't be themed, defeats hover/focus states and media
  queries, and lets hardcoded colors slip past review.
- Class names: `k-` + kebab-case, BEM-ish by suffix — `k-empty-state`,
  `k-empty-state-block`, `k-empty-state-icon`. Modifier classes are generated
  from props (`k-page-gap-${gap}`, `k-form-grid-${columns}col`).
- No `k-` prefix on CSS custom properties.

### Acceptable inline-style cases (rare)

Each exists in the library today:

- **Data-driven color** — `Badge variant="custom" color={hex}` sets
  `backgroundColor` inline and picks `var(--text-color-light)` or
  `var(--text-color)` for contrast (`feedback/badge/utils.ts`).
- **Runtime measurements** — floating position from `useFloatingPosition`
  (`Tooltip`, `SearchSelect`), table column `width`/`minWidth`/`maxWidth` from
  `TableColumn`.
- **Caller escape hatches** — `Row`, `Col` and `Table` accept a `style` prop.
  Don't add `style` props to new components.

Everything else: **add a class, add a rule, use a var**.

## Colors + theming

**All colors come from CSS variables defined in `src/styles.css`.** Never write
hex/rgb/hsl literals or named colors (`white`) in component CSS or inline styles.
Themes swap by setting `data-theme="dark"` on `<html>` — the consuming app does
that; the library only defines both token sets. `color-mix(in srgb, var(--x) 15%,
var(--background-color))` is fine for tints (Badge `subtle` does it).

### Token families

| Family | Tokens |
|--------|--------|
| Primary | `--primary-color`, `-hover`, `-active`, `-dark`, `-background`, `-background-light` |
| Secondary | `--secondary-color`, `-hover`, `-active`, `-background` |
| Light | `--light-color`, `-hover`, `-active`, `-background` |
| Warning | `--warning-color`, `-hover`, `-active`, `-background`, `-background-light`, `-text` |
| Danger | `--danger-color`, `-hover`, `-active`, `-background` |
| Success | `--success-color`, `-hover`, `-active`, `-background`, `-background-light` |
| Surface | `--background-color`, `-dark`, `-light`, `-hover`, `-overlay` |
| Border / shadow | `--border-color`, `--border-color-active`, `--border-shadow-color-active`, `--shadow-color`, `--shadow-color-hover`, `--shadow-color-active` |
| Overlay | `--overlay-dark-weak`, `-medium`, `-strong`; `--overlay-light-weak`, `-medium`, `-strong` |
| Text | `--text-color`, `--text-color-secondary`, `--text-color-light`, `--text-color-link` |
| Type scale | `--text-size-sm`, `-md`, `-lg`, `-xl`, `-2xl`, `-3xl` |

### Picking a color

1. **Variant prop first** — `<Button variant="danger">`, `<Badge variant="success">`,
   `<Alert variant="warning">`. The component maps it to tokens.
2. **CSS var second** — `color: var(--text-color); background: var(--background-color-light);
   border: 1px solid var(--border-color);`
3. **New token** — add it to `src/styles.css` under **both** `:root` and
   `[data-theme="dark"]`, in the matching family. Only reference tokens that
   exist (`--text-color-muted`, used with a fallback in `detailField`, is not
   defined).

### DON'T

- `color: #333;` → `var(--text-color)`
- `background: white;` → `var(--background-color-light)`
- `rgba(0, 0, 0, 0.1)` shadows → `var(--shadow-color*)` / `var(--overlay-dark-*)`
- `style={{ color: "#dc3545" }}` → `<Badge variant="danger">` or `var(--danger-color)`

## Shared types (`components/types.ts`)

```ts
type Variant = "primary" | "secondary" | "light" | "danger"
  | "warning" | "success" | "custom" | "link";
type Size = "sm" | "md" | "lg";
type FlexAlign = "start" | "center" | "end" | "baseline" | "stretch";
type FlexJustify = "start" | "center" | "end" | "between" | "around";
```

`variant="custom"` is Badge-only (requires `color`). `variant="link"` is
Button-only.

## Component catalog

**Check this list before building anything.** If something close exists, extend
it (add a prop) instead of forking.

### Layout — `layout/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Page` | Outermost page shell | `fillHeight`, `padded`, `gap="none"\|"sm"\|"md"`, `maxWidth="none"\|"narrow"\|"default"\|"wide"`, `loading` (centered spinner) |
| `AuthPage` | Centered card for login/consent/2FA views | `title`, `subtitle`, `width="narrow"\|"wide"`, `footer` |
| `Card` | Bordered content block | `header={{title, actions}}` or node, `progress={{current, total, label}}`, `footer`, `hoverable`, `onClick`, `padding="none"\|"small"\|"default"\|"large"`, `align`, `variant` |
| `BorderedSection` | Titled region on a detail page | `title`, `actions`, `layout="stack"\|"row"`, `gap="sm"\|"md"` |
| `SectionHeader` | Heading with extras | `title`, `subtitle`, `badges`, `preface`, `center`, `actions`, `leading`, `as="h1"…"h4"` (default `h3`), `dense`, `divider` |
| `Centered` | Center a child in available space | — |
| `Row` / `Col` | Flex row / column | `size` (gap), `align`, `justify`, `wrap`; `Row` `inline`; `Col` `span="full"`, `divider="solid-top"` |

### Forms — `forms/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Form` | `<form>` wrapper | `onSubmit`, `id`, `noValidate` |
| `FormGrid` | Responsive grid of fields or detail labels | `columns={1\|2\|3\|4}` (default 2), `gap="sm"\|"md"\|"lg"` |
| `FormActions` | Footer row of buttons outside a Modal | `align="right"\|"between"\|"center"\|"left"\|"fill"`, `spacing` |
| `FormError` | Form-level error block | `children` |
| `DetailField` | Read-only label/value pair | `label`, `value`, `action` |
| `InfoRow` | Compact label/value | `label`, `value`, `layout="horizontal"\|"stacked"` |

### Inputs — `inputs/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Input` | Text/number/email/… | `type`, `label`, `required`, `placeholder`, `prefix`, `suffix`, `error`, `helperText`, `showCharCount`, `size` |
| `TextArea` | Multi-line text | Same shell props as `Input` |
| `Select` | Value-typed dropdown | `options=[{value, label}]`, `value`, `onChange(value \| undefined)`, `placeholder` |
| `MultiSelect` | Multi-value chips | `options`, `value`, `labelKey`, `onChange(values)` |
| `SearchSelect` | Filterable single select over local options | `options`, `value`, `getOptionLabel`, `getOptionKey`, `onSelect`, `renderOption` |
| `Typeahead` | Async/local search picker | `options`, `onSelect`, `value`, `labelKey` **or** `renderOption`, `onFilterChange`, `lazyLoad`, `showAll` |
| `SearchList` | Search results list without an input shell | Pair with a custom trigger |
| `LanguageSelect` | Language picker over `SUPPORTED_LANGUAGES` | `value`, `onChange`, `includeNone` |
| `Checkbox` / `CheckboxGroup` | One box / a set | Group: `name`, `options`, `values`, `onChange(values)` |
| `RadioGroup` | Radio set | `name`, `options`, `value`, `onChange` |
| `Switch` | Toggle | `checked`, `onChange`, `label`, `labelLocation`, `isLoading`, `size="sm"\|"md"` |
| `PhoneInput` | E.164 phone with country | `CountryCode` type re-exported |
| `DateInput` / `DateTimeInput` / `TimeInput` | Date pickers | ISO strings in and out |
| `Dropdown` | Anchored popover menu | `label`, `icon`, `align="left"\|"right"`, `renderCaret`, `isOpen`, `onOpenChange` |
| `ColorPicker` | Hex chooser | For user-supplied data only |
| `RichTextEditor` | Tiptap WYSIWYG | Don't build custom Markdown UI |
| `FileUpload` | File input with list | `onFileSelect`, `multiple`, `accept`, `maxSize`, `allowDirectory`, `renderFiles` |
| `FileDropZone` | Drag-and-drop target | `onFilesSelected`, `onError`, `maxFiles`, `accept` |

### Buttons — `buttons/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Button` | Text button | `variant`, `size`, `isLoading`, `disabled`, `align`, `shadow`, `fullWidth`, `type`, `form`, `title` |
| `IconButton` | Button with a FontAwesome icon | `ButtonProps` + `icon` |
| `RowActions` | Inline row of action buttons in a table cell | `align="start"\|"center"\|"end"`, `gap="xs"\|"sm"\|"md"` |

### Overlays — `overlays/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Modal` | Standard modal (focus trap, Escape closes) | `show`, `onClose`, `title`, `footerButtons=[…]`, `size="sm"\|"md"\|"lg"\|"full"` |
| `ConfirmationModal` | Confirm/cancel dialog with a danger button | `show`, `handleHide`, `handleConfirm`, `title`, `body` (string), `confirmButtonText`, `cancelButtonText`, `isLoading` |
| `Portal` | Render into `document.body` | Building block for Modal, Tooltip, Typeahead, SearchList, SearchSelect |

### Feedback — `feedback/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Alert` | Inline banner | `variant`, `heading`, `dismissible`, `onDismiss`, `size` |
| `Badge` | Status pill | `variant`, `size`, `pill` (default true), `subtle`, `color` (custom), `onRemove`, `startIcon`, `onClick` |
| `Spinner` | Inline spinner | `size`, `variant` — wrap in `<Centered>` for area loaders |
| `LoadingOverlay` | Blocking overlay | `show`, `message`, `fullPage` |
| `ProgressBar` | Determinate progress | `progress` (0–100), `showPercentage` |
| `EmptyState` | "No data" placeholder | `layout="inline"\|"block"`, `icon`, `action` (block only) |
| `Tooltip` | Hover/focus tooltip around one element | `content`, `position`, `fullWidth`, `disabled` |

### Data display — `data-display/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `InfiniteScroll` | List-page workhorse: filters, sort, selection, load-more | `menu`, `columns`, `data`, `hasMore`, `isLoading`, `onQueryChange`, `onReload`, `onRowClick`, `onAddNew`, `onDelete`, `onDownload`, `hideFilters`, `hideSelectColumn` |
| `Table` | Static table | `columns`, `rows`, `rowKey`, `onRowClick`, `emptyMessage`, `striped`, `bordered`, `hover`, `maxHeight` |
| `DataTable` | Table with a leading (selection) column — InfiniteScroll's body | `columns`, `rows` (`TableRow<T>[]`), `leadingColumn`, `onRowClick` |
| `StatCard` | KPI tile | `label`, `value`, `icon`, `iconVariant`, `trailing`, `href`, `onClick`, `compact` |
| `SummaryRow` | Strip of label/value metrics | `items: SummaryRowItem[]` |
| `ListCard` | Card of label/value items | `listTitle`, `items`, `headerActions`, `footerButtons` |
| `ListRow` | Bare row with trailing actions | `actions` |
| `TagCard` | Titled set of tags | `title`, `tags`, `color="primary"\|"secondary"`, `emptyText` |
| `ImagePreview` | Thumbnails with clear/change | `previewUrls`, `onClear`, `onChange` |
| `ColorSwatch` | Color block for data-supplied colors | `color`, `size`, `bordered`, `title` |
| `AddressBlock` | Formatted postal address | `address: AddressBlockAddress`, `label`, `variant="full"\|"compact"` |
| `RecoveryCodeGrid` | 2FA recovery codes | `codes`, `columns={1\|2\|3}`, `numbered` |
| `SecretDisplay` | Masked secret, reveal + copy | `value`, `copyable`, `revealable`, `maskLength` |

`TableColumn<T>`: `title`, `dataKey`, `width`/`minWidth`/`maxWidth`, `align`,
`hidden`, `disableRowClick`, `headerElement`, `cellElement(row, index)`.

### Navigation — `navigation/`

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Tabs` | Tab strip with optional panels | `tabs=[{key, label, content?, disabled?}]`, `active`, `onChange`, `stripOnly` |
| `TabButton` | One tab-styled button | `active`, `onClick`, `disabled` |
| `Breadcrumbs` | Path nav | `items=[{label, path, onClick?}]` |
| `Stepper` | Multi-step progress | `steps=[{key, label, icon?, status, clickable?}]`, `orientation`, `onStepClick` |
| `Pagination` | Page controls for a paged list | `page`, `pageCount`, `onPageChange`, `total` + `pageSize` ("51–75 of 240"), `pageSizeOptions` + `onPageSizeChange`, `siblingCount`, `size` |
| `Sidebar` / `SidebarNavGroup` / `SidebarNavLink` | Section nav | `SidebarNavGroup label`; `SidebarNavLink as={NavLink} to icon` — `as` defaults to `a` |

## Hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useInfiniteCursor` | **Default** list fetching for cursor endpoints (`{ data, hasMore, limit, nextCursor }`). Takes `axiosInstance`, `endpoint`, `queryKey`, `orgId`, `initialLimit`, `enabled`; returns `UseInfiniteReturn<T>` for `InfiniteScroll` |
| `usePaginated` | One page at a time from an offset endpoint (`limit`/`offset` in, `{ data, total }` out) for `Pagination`. Takes `axiosInstance`, `endpoint`, `queryKey`, `initialPageSize`, `params` (filters/sort; a change returns to page 1); returns `data`, `total`, `page`, `pageCount`, `setPage`, `setPageSize` |
| `useInfiniteArchivableCursor` | Same, for archivable resources — lifts the "Archived" filter to a top-level `includeArchived` param |
| `useInfinite` | Legacy offset pagination — don't use in new code; exports the `UseInfiniteReturn` type |
| `useLocalStorage` | Typed localStorage with cross-tab sync |
| `useFloatingPosition` | Anchor-relative positioning (Tooltip, SearchSelect) |
| `useOutsideClick` | Click-outside detection |
| `useListKeyboard` | Arrow/Enter/Escape navigation for dropdown lists |
| `useScrollIntoView` | Scroll the highlighted item into view |
| `useDebouncedValue` | Debounce a value by N ms |
| `useFocusTrap` | Trap Tab focus in a container (Modal) |

## When to extend vs. build new

1. **An existing component covers ~70%+** → use it; compose children, pass slots
   as props.
2. **A small variation** → add a prop (`size`, `variant`, `padding`, …) to the
   existing component.
3. **A genuinely new primitive** → new folder under the right bucket with
   `index.tsx` + `styles.css`, exported from the flat barrel with its props type.
4. **App-specific composition** → belongs in the app, built from these
   primitives — not in the library.

## Build

```sh
cd packages/react
npm run build    # tsc, then node scripts/copy-css.js (copies src/**/*.css to dist/)
npm run check    # tsc --noEmit, then the tests' tsconfig.spec.json
npm run test     # vitest run
npm run clean    # rm -rf dist tsconfig.tsbuildinfo
```

Or from the root: `npx nx run @kosmeo-ui/react:build`. `npm test`, `npm run check`,
`npm run lint` and `npm run format:check` are the gate. A change to a component or
hook comes with tests — the `testing` skill
([../testing/SKILL.md](../testing/SKILL.md)) says how to write them.
Every change to the library needs a version plan: `npm run version-plan`.

## DO

- **Scan the catalog before writing a component.** Extend before forking.
- Default export the component, export `<Name>Props`, add both to the barrel.
- One `styles.css` per component, imported by its `index.tsx`; `k-` classes only.
- Pull every color from a token or a variant prop; add new tokens to both themes.
- Use `PropsWithVariant` / `PropsWithSize` and the shared `Variant` / `Size` types.
- Declare every runtime import in `package.json`.
- Run `npm run build` in the package after changing CSS — `tsc` alone doesn't
  copy it.

## DON'T

- Never inline `style={{}}` outside the cases above, or add new `style` props.
- Never hardcode hex/rgb/hsl or named colors.
- Never leave the extension off a relative import.
- Never style a class without the `k-` prefix, except third-party markup scoped under a
  `k-` class (`.k-editor-wrapper .tiptap`).
- Never import from an app package — the library has zero internal
  dependencies.
- Never put app concerns (routing, auth, HTTP clients) in a component; take
  callbacks, an `AxiosInstance` or an `as` element type as props instead.

## Related skills

- `comments` — comment rules for any code here.
