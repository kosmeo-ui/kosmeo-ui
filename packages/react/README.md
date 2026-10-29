<p align="center">
  <img src="https://raw.githubusercontent.com/kosmeo-ui/kosmeo-ui/master/assets/kosmeo-banner.png" alt="Kosmeo — React UI components" width="720">
</p>

# @kosmeo-ui/react

React component library. All CSS classes use a `k-` prefix and are themed with CSS variables (light, and dark via
`data-theme="dark"` on `<html>`). `InfiniteScroll` with the `useInfiniteCursor` hook is the
standard list-page pattern: cursor-paginated fetching, sorting, filters and bulk selection in one
component.

The component catalog with key props is in
[`.claude/skills/ui/SKILL.md`](https://github.com/kosmeo-ui/kosmeo-ui/blob/master/.claude/skills/ui/SKILL.md).

## Install

```sh
npm install @kosmeo-ui/react
```

Peer dependencies: `react` and `react-dom` 19, and `@tanstack/react-query` 5. The app and the
library must share one copy of react-query; under Vite, add it to `resolve.dedupe` with React. The
infinite-list hooks take an `AxiosInstance`, so `axios` is an optional peer — install it if you use
them.

Components import their own stylesheets, so the app's bundler must handle CSS imports from
`node_modules` — Vite, Next.js and webpack with `css-loader` all do.

## Usage

```typescript
import { Button, Modal, InfiniteScroll, useInfiniteCursor } from "@kosmeo-ui/react";
import type { Variant, Size, TableColumn } from "@kosmeo-ui/react";

// Required in app entry point:
import "@kosmeo-ui/react/styles.css";
```

## Components

**Layout**: `Page`, `AuthPage`, `Card`, `BorderedSection`, `SectionHeader`, `Centered`, `Row`, `Col`, `AppTopBar` (its links fold into a menu when they don't fit), `SectionLayout`

**Forms**: `Form`, `FormGrid`, `FormActions`, `FormError`, `DetailField`, `InfoRow`

**Inputs**: `Input`, `TextArea`, `Select`, `MultiSelect`, `SearchSelect`, `Typeahead`,
`SearchList`, `LanguageSelect`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `PhoneInput`,
`DateInput` / `DateTimeInput` / `TimeInput`, `Dropdown`, `ColorPicker`, `RichTextEditor`,
`FileUpload`, `FileDropZone`

**Buttons**: `Button`, `IconButton`, `RowActions`

**Overlays**: `Modal`, `ConfirmationModal`, `Portal`

**Feedback**: `Alert`, `Badge`, `Spinner`, `LoadingOverlay`, `ProgressBar`, `EmptyState`, `Tooltip`

**Data display**: `InfiniteScroll`, `Table` (with `TableCellLink`, `TableCellButton`), `DataTable`, `StatCard`, `SummaryRow`, `ListCard`,
`ListRow`, `TagCard`, `ImagePreview`, `ColorSwatch`, `AddressBlock`, `RecoveryCodeGrid`,
`SecretDisplay`

**Navigation**: `Tabs`, `TabButton`, `Breadcrumbs`, `Stepper`, `Sidebar` (with `SidebarNavGroup`,
`SidebarNavLink`)

## Shared Types

```typescript
type Variant = "primary" | "secondary" | "light" | "danger" | "warning" | "success" | "custom" | "link";
type Size = "sm" | "md" | "lg";
```

`variant="custom"` is Badge-only (with a `color` prop); `variant="link"` is Button-only.

## Theming

Theme tokens are defined in `src/styles.css` on `:root` (light) and `[data-theme="dark"]`. Import
`styles.css` in your app entry point and override the variables to customize the theme. Every token
is `--k-` prefixed (`--k-primary-color`, `--k-text-color`) so it can't collide with your app's own
variables.

`ThemeProvider` does the overriding from React, with each token named in camelCase
(`primaryColor` for `--k-primary-color`) and typed:

```tsx
import { ThemeProvider, type Theme } from "@kosmeo-ui/react";

const theme: Theme = {
  light: { primaryColor: "#0f766e", primaryColorText: "#0f766e", backgroundColor: "#f6faf9" },
  dark: { primaryColor: "#2dd4bf", primaryColorText: "#5eead4", backgroundColor: "#0b1513" },
};

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>;
```

Its rules outrank `styles.css` whatever order the CSS loads in. Tokens you leave out keep the
library's values. A `primaryColor`, `secondaryColor`, `warningColor`, `dangerColor` or
`successColor` without its `…Hover`/`…Active` shades gets them mixed from it. The `…Text` tokens
are tuned for contrast against the page, so set them yourself when you change a family's color.
Switching between light and dark is still `data-theme` on `<html>`.

`styles.css` is a global base, not only tokens: it also resets `html`, `body`, headings, links,
form-control fonts and scrollbars. Import it once, in the app's entry point.

## Commands

```bash
npm run build    # Compile TypeScript + copy CSS to dist/
npm run check    # Type-check without emitting
npm run clean    # Remove dist/
```

## License

Apache-2.0
