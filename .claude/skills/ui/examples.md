# @kosmeo-ui/react Code Examples

Sections 1–6 are real code from `packages/react/src`, verbatim or
trimmed where marked. Sections 7–9 are templates for new work, built on the same
conventions.

---

## 1. A complete component — `components/feedback/emptyState/`

The smallest full shape: exported props interface, default export, classes
derived from props, stylesheet imported by the component.

```tsx
// index.tsx
import { ReactNode } from "react";
import "./styles.css";

export interface EmptyStateProps {
  children: ReactNode;
  /** "inline" = small grey text suitable inside a list (default). "block" = padded centered. */
  layout?: "inline" | "block";
  icon?: ReactNode;
  /** Call-to-action rendered below children. Only used with layout="block". */
  action?: ReactNode;
}

const EmptyState = ({
  children,
  layout = "inline",
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className={`k-empty-state k-empty-state-${layout}`}>
      {icon && <div className="k-empty-state-icon">{icon}</div>}
      <div className="k-empty-state-body">{children}</div>
      {layout === "block" && action && (
        <div className="k-empty-state-action">{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
```

```css
/* styles.css */
.k-empty-state-inline {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.65;
  font-style: italic;
  padding: 0.5rem 0;
}

.k-empty-state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-color);
  opacity: 0.75;
}

.k-empty-state-icon {
  font-size: 2rem;
  opacity: 0.5;
}
```

## 2. Composing across buckets, modifier classes — `components/layout/page/`

`Page` pulls `Spinner` from another bucket and `Centered` from its own, and
builds its class list from props.

```tsx
import Spinner from "../../feedback/spinner/index.js";
import Centered from "../centered/index.js";
import { ReactNode } from "react";
import "./styles.css";

export type PageGap = "none" | "sm" | "md";
export type PageMaxWidth = "none" | "narrow" | "default" | "wide";

export interface PageProps {
  children?: ReactNode;
  /** Fill parent height (`height: 100%`). Use for list pages with internal scroll regions. */
  fillHeight?: boolean;
  /** Apply 1.5rem padding (1rem on small screens). */
  padded?: boolean;
  /** Vertical gap between direct children. */
  gap?: PageGap;
  /** Centered max-width constraint. */
  maxWidth?: PageMaxWidth;
  /** Loading state. Renders centered spinner when true. */
  loading?: boolean;
}

const Page = ({
  children,
  fillHeight,
  padded,
  gap = "none",
  maxWidth = "default",
  loading,
}: PageProps) => {
  const classes = [
    "k-page",
    fillHeight && "k-page-fill",
    padded && "k-page-padded",
    gap !== "none" && `k-page-gap-${gap}`,
    maxWidth !== "none" && `k-page-max-${maxWidth}`,
  ]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className={`${classes} k-page-loading`}>
        <Centered>
          <Spinner />
        </Centered>
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
};

export default Page;
```

```css
/* styles.css (trimmed) */
.k-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.k-page-fill {
  height: 100%;
  min-height: 0;
}

.k-page-gap-sm {
  gap: 0.75rem;
}

.k-page-max-narrow {
  max-width: 48rem;
  margin: 0 auto;
}
```

## 3. Variant and size props — `components/feedback/badge/` (trimmed)

`PropsWithSize` / `PropsWithVariant` from `components/types.ts`; each value maps
to a class. The `custom` variant is the library's one data-driven inline color.

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize, PropsWithVariant } from "../../types.js";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getContrastTextColor } from "./utils.js";
import "./styles.css";

export interface BadgeProps extends PropsWithSize, PropsWithVariant {
  /** The content to display inside the badge */
  children: React.ReactNode;
  /** Whether to use pill-shaped (fully rounded) styling. Defaults to true */
  pill?: boolean;
  /** Whether to use subtle styling with transparent background. Defaults to false */
  subtle?: boolean;
  /** Custom hex color. Required when variant="custom". Sets background and auto-picks contrast text color. */
  color?: string;
  // … onRemove, startIcon, onClick, ariaLabel
}

const Badge = ({
  children,
  size = "md",
  variant = "primary",
  pill = true,
  subtle = false,
  color,
  // …
}: BadgeProps) => {
  if (variant === "custom" && !color) {
    throw new Error(
      'Badge: variant="custom" requires a `color` prop (hex string).'
    );
  }

  const pillClass = pill ? "k-badge-pill" : "";
  const subtleClass = subtle ? "k-badge-subtle" : "";
  const clickableClass = onClick ? "k-badge-clickable" : "";
  const classes =
    `k-badge k-badge-${variant} k-badge-${size} ${pillClass} ${subtleClass} ${clickableClass}`.trim();

  const inlineStyle =
    variant === "custom" && color
      ? {
          backgroundColor: color,
          color:
            getContrastTextColor(color) === "light"
              ? "var(--text-color-light)"
              : "var(--text-color)",
        }
      : undefined;
  // …
  return (
    <span className={classes} style={inlineStyle}>
      {content}
    </span>
  );
};

export default Badge;
```

```css
/* styles.css (trimmed) — every color is a token */
.k-badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.k-badge-primary {
  background-color: var(--primary-color);
  color: var(--text-color-light);
}

.k-badge-warning {
  background-color: var(--warning-color);
  color: var(--text-color);
}

.k-badge-subtle.k-badge-primary {
  background-color: color-mix(
    in srgb,
    var(--primary-color) 15%,
    var(--background-color)
  );
  color: var(--primary-color);
}
```

## 4. Wrapping existing components — `components/overlays/confirmationModal/`

Built from `Modal` and `Button` rather than new markup; no stylesheet needed.

```tsx
import Button from "../../buttons/button/index.js";
import Modal from "../modal/index.js";

export interface ConfirmationModalProps {
  show: boolean;
  handleHide: () => void;
  handleConfirm: () => void;
  title: string;
  body: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  return (
    <Modal
      show={props.show}
      title={props.title}
      onClose={props.handleHide}
      footerButtons={[
        <Button
          key="cancel"
          variant="secondary"
          onClick={props.handleHide}
          disabled={props.isLoading}
        >
          {props.cancelButtonText || "Cancel"}
        </Button>,
        <Button
          key="confirm"
          variant="danger"
          onClick={props.handleConfirm}
          isLoading={props.isLoading}
          disabled={props.isLoading}
        >
          {props.confirmButtonText}
        </Button>,
      ]}
    >
      {props.body}
    </Modal>
  );
};

export default ConfirmationModal;
```

## 5. A hook — `hooks/useDebouncedValue.ts`

One hook per file, default export, registered in `hooks/index.ts`.

```ts
import { useEffect, useState } from "react";

/**
 * Returns `value` after it has remained unchanged for `delay` milliseconds.
 * Resets the timer on every change.
 */
const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
```

```ts
// hooks/index.ts
export { default as useDebouncedValue } from "./useDebouncedValue.js";
```

## 6. Theme tokens — `src/styles.css` (trimmed)

Every token is defined twice: light on `:root`, dark on `[data-theme="dark"]`.

```css
:root {
  /* Primary Colors */
  --primary-color: #17257d;
  --primary-color-dark: #1a2332;
  --primary-color-hover: #2032ac;
  --primary-color-active: #141f6c;
  --primary-color-background: #3d52db;
  --primary-color-background-light: #f0f2ff;
  /* … */
}

[data-theme="dark"] {
  /* Primary Colors — desaturated, less violent on dark surfaces */
  --primary-color: #4a5fb5;
  --primary-color-dark: #0e1119;
  --primary-color-hover: #5a70c4;
  --primary-color-active: #3d4f99;
  --primary-color-background: #4a5fb5;
  --primary-color-background-light: #1c2240;
  /* … */
}
```

Hex literals belong **only** here. A new token goes into the matching family in
both blocks, then component CSS reads it with `var(--…)`.

## 7. Template — adding `MyWidget`

```
packages/react/src/components/<bucket>/myWidget/
  index.tsx        # default export + exported MyWidgetProps
  styles.css       # k-my-widget rules, tokens only
```

```tsx
// index.tsx
import type { PropsWithVariant } from "../../types.js";
import Button from "../../buttons/button/index.js";
import { ReactNode } from "react";
import "./styles.css";

export interface MyWidgetProps extends PropsWithVariant {
  title: ReactNode;
  children: ReactNode;
  /** Renders a footer button when set. */
  onAction?: () => void;
}

const MyWidget = ({
  title,
  children,
  variant = "primary",
  onAction,
}: MyWidgetProps) => (
  <div className={`k-my-widget k-my-widget-${variant}`}>
    <div className="k-my-widget-title">{title}</div>
    <div className="k-my-widget-body">{children}</div>
    {onAction && (
      <Button size="sm" variant={variant} onClick={onAction}>
        Go
      </Button>
    )}
  </div>
);

export default MyWidget;
```

```css
/* styles.css */
.k-my-widget {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--background-color-light);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-color);
}

.k-my-widget-title {
  font-size: var(--text-size-lg);
  font-weight: 600;
}

.k-my-widget-danger {
  border-color: var(--danger-color);
}
```

## 8. Template — exporting it

In `src/components/index.ts`, add the component to the `export { default as … }`
block and the props type to the `export type { … }` block. Both blocks are kept
longest line first, by hand — `sort-imports` only orders imports:

```ts
export { default as MyWidget } from "./<bucket>/myWidget/index.js";
export type { MyWidgetProps } from "./<bucket>/myWidget/index.js";
```

Consumers import it from the package root:
`import { MyWidget } from "@kosmeo-ui/react";`. Then `npm run build` in
`packages/react` and `npm run version-plan` from the root.

## 9. Template — a list page from the library's pieces

How a consumer wires `useInfiniteCursor` into `InfiniteScroll` against a
cursor-paginated endpoint (`GET /v1/services`). The app supplies the authenticated
`AxiosInstance`.

```tsx
import type { InfiniteScrollMenu, TableColumn } from "@kosmeo-ui/react";
import type { AxiosInstance } from "axios";
import { useMemo } from "react";
import {
  Page,
  Badge,
  InfiniteScroll,
  useInfiniteCursor,
} from "@kosmeo-ui/react";

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
}

export const ServiceList = ({ axios }: { axios: AxiosInstance }) => {
  const { data, hasMore, isLoading, onQueryChange, reload } =
    useInfiniteCursor<ServiceRow>({
      axiosInstance: axios,
      endpoint: "/v1/services",
      queryKey: "services",
    });

  const columns: TableColumn<ServiceRow>[] = useMemo(
    () => [
      { title: "Name", dataKey: "name" },
      { title: "Slug", dataKey: "slug", width: "14rem" },
      {
        title: "Status",
        dataKey: "isActive",
        width: "8rem",
        align: "center",
        cellElement: (s) => (
          <Badge variant={s.isActive ? "success" : "secondary"}>
            {s.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  const menu: InfiniteScrollMenu = useMemo(
    () => ({
      title: "Services",
      filters: [
        { type: "SEARCH", title: "Name", dataKey: "name" },
        { type: "SEARCH", title: "Slug", dataKey: "slug" },
      ],
      sort: {
        sortDataKeys: [{ dataKey: "name", displayName: "Name", selected: true }],
        sortDirection: "asc",
      },
    }),
    []
  );

  return (
    <Page fillHeight maxWidth="none">
      <InfiniteScroll<ServiceRow>
        menu={menu}
        data={data}
        hasMore={hasMore}
        isLoading={isLoading}
        onQueryChange={onQueryChange}
        onReload={reload}
        columns={columns}
        hideSelectColumn
      />
    </Page>
  );
};
```
