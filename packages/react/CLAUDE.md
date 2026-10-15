# CLAUDE.md - @kosmeo-ui/react

React component library — production components with CSS variable theming (light/dark via `data-theme` on `<html>`), `k-` prefixed CSS classes, `Variant`/`Size` prop patterns, and FontAwesome icons.

**Component catalog and patterns**: [.claude/skills/ui/SKILL.md](../../.claude/skills/ui/SKILL.md)

## Structure

```
src/
├── index.ts                    # Barrel exports
├── styles.css                  # Global styles + CSS variable definitions (light + dark)
├── components/
│   ├── index.ts                # Flat component barrel — public API
│   ├── types.ts                # Variant, Size, FlexAlign, FlexJustify shared types
│   ├── layout/                 # Page, AuthPage, BorderedSection, SectionHeader, Card,
│   │                           # Centered, Row, Col
│   ├── forms/                  # Form, FormGrid, FormActions (+ FormError), DetailField,
│   │                           # InfoRow, FieldShell, OptionsGroup, RequiredAsterisk
│   ├── inputs/                 # Input, TextArea, Select, MultiSelect, Checkbox,
│   │                           # CheckboxGroup, RadioGroup, Switch, PhoneInput,
│   │                           # DateInput (+ DateTimeInput, TimeInput), Typeahead,
│   │                           # SearchList, Dropdown, DropdownArrowButton, ColorPicker,
│   │                           # RichTextEditor, FileUpload, FileDropZone
│   ├── buttons/                # Button, IconButton, RowActions
│   ├── overlays/               # Modal, ConfirmationModal, Portal
│   ├── feedback/               # Alert, Spinner, LoadingOverlay, ProgressBar,
│   │                           # EmptyState, Tooltip, Badge
│   ├── data-display/           # Table, DataTable, InfiniteScroll, ListCard, ListRow,
│   │                           # TagCard, ImagePreview, ColorSwatch, AddressBlock,
│   │                           # RecoveryCodeGrid, SecretDisplay, StatCard, SummaryRow
│   └── navigation/             # Tabs, TabButton, Breadcrumbs, Stepper, Pagination,
│                               # Sidebar (+ SidebarNavGroup, SidebarNavLink)
└── hooks/
    ├── useInfinite.ts          # Infinite scroll data fetching (React Query)
    ├── useInfiniteCursor.ts    # Cursor-based infinite scroll
    ├── usePaginated.ts         # Offset pages with a total, for Pagination
    ├── useLocalStorage.tsx     # Typed localStorage hook with cross-tab sync
    ├── useFloatingPosition.ts  # Anchor-relative positioning, side-aware, viewport clamp
    ├── useOutsideClick.ts      # Click-outside detection
    ├── useListKeyboard.ts      # Arrow/Enter/Escape keyboard nav for dropdown lists
    ├── useScrollIntoView.ts    # Scrolls highlighted ref into view
    ├── useDebouncedValue.ts    # Debounce a value by N ms
    └── useFocusTrap.ts         # Trap Tab focus inside a container (Modal)
```

Components are grouped into subfolders by category, but the public barrel
(`components/index.ts`) is flat — consumers still import everything from the
package root: `import { Button } from "@kosmeo-ui/react"`.

## Usage

```typescript
import { Button, Modal, InfiniteScroll, useInfiniteCursor } from "@kosmeo-ui/react";
import type { Variant, Size, InfiniteScrollMenu } from "@kosmeo-ui/react";

// Required in app entry point:
import "@kosmeo-ui/react/styles.css";
```

## Components

**Layout**: `Row`, `Col`, `Card`, `Centered`, `Page`, `AuthPage`, `BorderedSection`, `SectionHeader`

**Forms**: `Form`, `FormGrid`, `FormActions`, `FormError`, `DetailField`, `InfoRow`

**Inputs**: `Input`, `TextArea`, `Select`, `MultiSelect`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `PhoneInput`, `DateInput` / `DateTimeInput` / `TimeInput`, `Typeahead`, `SearchList`, `Dropdown`, `DropdownArrowButton`, `ColorPicker`, `RichTextEditor`, `FileUpload`, `FileDropZone`

**Buttons**: `Button`, `IconButton`, `RowActions`

**Overlays**: `Modal`, `ConfirmationModal`, `Portal`

**Feedback**: `Alert`, `Badge`, `Spinner`, `LoadingOverlay`, `ProgressBar`, `EmptyState`, `Tooltip`

**Data display**: `Table`, `DataTable`, `InfiniteScroll`, `ListCard`, `ListRow`, `TagCard`, `ImagePreview`, `ColorSwatch`, `AddressBlock`, `RecoveryCodeGrid`, `SecretDisplay`, `StatCard`, `SummaryRow`

**Navigation**: `Tabs`, `TabButton`, `Breadcrumbs`, `Stepper`, `Pagination`, `Sidebar` (with `SidebarNavGroup`, `SidebarNavLink`)

> Consolidation history: `PageContainer`/`DetailPage` → `Page` (`fillHeight`/`padded`/`gap`/`maxWidth`/`loading`). `FullScreenModal` → `Modal size="full"`. `DetailGrid` → `FormGrid`. `DetailHeader` → `SectionHeader as="h1"` (with `preface`/`badges`). `WorkflowCard` → `Card` + `footer`/`progress` props. `SymbolInput` → `Input prefix`/`suffix`. `Error` → `Alert variant="danger"` (with optional `heading`). `ImageUpload` → `FileUpload` + `ImagePreview` composition via `renderFiles`. `SectionContainer`/`ContentContainer` deleted (unused). Shared internals: `FieldShell` (Input/TextArea/Select/MultiSelect/DateInput shell), `OptionsGroup` (CheckboxGroup/RadioGroup shell), `Portal` (Modal/Tooltip/Typeahead/SearchList).

## Shared Types

```typescript
type Variant = "primary" | "secondary" | "light" | "danger" | "warning" | "success" | "custom" | "link";
type Size = "sm" | "md" | "lg";
type FlexAlign = "start" | "center" | "end" | "baseline" | "stretch";
type FlexJustify = "start" | "center" | "end" | "between" | "around";
```

`variant="custom"` is Badge-only (requires `color` prop). `variant="link"` is Button-only (styled as inline text link).

## CSS Convention

All CSS classes use `k-` prefix: `k-button`, `k-button-primary`, `k-button-sm`. Theme tokens are defined in `styles.css` on `:root` (light) and `[data-theme="dark"]`. Consuming apps set `document.documentElement.dataset.theme = "dark"` to switch themes; persisting the choice and falling back to `prefers-color-scheme` is the app's job.

## Build

```bash
npm run build    # tsc + copy CSS files to dist/
npm run check    # Type-check only
npm run clean    # Remove dist/, tsconfig.tsbuildinfo
```
