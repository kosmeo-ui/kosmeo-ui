import {
  faBell,
  faCompass,
  faFileLines,
  faHandPointer,
  faKeyboard,
  faTable,
  faTableColumns,
  faWindowRestore,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export interface GalleryCategory {
  slug: string;
  title: string;
  icon: IconDefinition;
  /** `file` names a module in components/examples, without `.tsx`. */
  examples: { file: string; title: string }[];
}

// The library's own buckets (packages/react/src/components/*).
export const GALLERY_CATEGORIES: GalleryCategory[] = [
  {
    slug: "layout",
    title: "Layout",
    icon: faTableColumns,
    examples: [
      { file: "layout", title: "Page, Row, Col, Centered" },
      { file: "section-headers", title: "SectionHeader, BorderedSection" },
      { file: "cards", title: "Card" },
      { file: "auth-page", title: "AuthPage" },
      {
        file: "app-shell",
        title: "AppTopBar, AppTopBarLink, SectionLayout",
      },
    ],
  },
  {
    slug: "forms",
    title: "Forms",
    icon: faFileLines,
    examples: [
      { file: "forms", title: "Form, FormGrid, FormActions, FormError" },
      { file: "detail-fields", title: "DetailField" },
      { file: "info-rows", title: "InfoRow" },
    ],
  },
  {
    slug: "inputs",
    title: "Inputs",
    icon: faKeyboard,
    examples: [
      { file: "text-inputs", title: "Input, TextArea" },
      {
        file: "selects",
        title: "Select, MultiSelect, SearchSelect, LanguageSelect",
      },
      { file: "choices", title: "Checkbox, CheckboxGroup, RadioGroup, Switch" },
      {
        file: "date-and-phone-inputs",
        title: "DateInput, DateTimeInput, TimeInput, PhoneInput",
      },
      { file: "search-inputs", title: "Typeahead, SearchList" },
      { file: "color-picker", title: "ColorPicker" },
      { file: "rich-text-editor", title: "RichTextEditor" },
      { file: "file-inputs", title: "FileUpload, ImagePreview, FileDropZone" },
    ],
  },
  {
    slug: "buttons",
    title: "Buttons",
    icon: faHandPointer,
    examples: [{ file: "buttons", title: "Button, IconButton, Dropdown" }],
  },
  {
    slug: "overlays",
    title: "Overlays",
    icon: faWindowRestore,
    examples: [
      { file: "modals", title: "Modal, ConfirmationModal" },
      { file: "portal", title: "Portal" },
    ],
  },
  {
    slug: "feedback",
    title: "Feedback",
    icon: faBell,
    examples: [
      { file: "alerts", title: "Alert" },
      { file: "badges", title: "Badge" },
      {
        file: "loading-states",
        title: "Spinner, LoadingOverlay, EmptyState",
      },
      { file: "progress-bars", title: "ProgressBar" },
    ],
  },
  {
    slug: "data-display",
    title: "Data display",
    icon: faTable,
    examples: [
      { file: "tables", title: "Table, DataTable, RowActions" },
      { file: "infinite-scroll", title: "InfiniteScroll + useInfiniteCursor" },
      {
        file: "paged-table",
        title: "Table + TableFilters + Pagination + usePaginated",
      },
      { file: "stats", title: "StatCard, SummaryRow" },
      { file: "lists", title: "ListCard, ListRow, TagCard" },
      {
        file: "addresses-and-secrets",
        title: "AddressBlock, SecretDisplay, RecoveryCodeGrid",
      },
      { file: "color-swatches", title: "ColorSwatch" },
    ],
  },
  {
    slug: "navigation",
    title: "Navigation",
    icon: faCompass,
    examples: [
      { file: "tabs", title: "Tabs" },
      { file: "tab-buttons", title: "TabButton" },
      { file: "breadcrumbs-and-stepper", title: "Breadcrumbs, Stepper" },
      { file: "pagination", title: "Pagination" },
      {
        file: "sidebar",
        title: "Sidebar, SidebarNavGroup, SidebarNavLink",
      },
    ],
  },
];

export const findGalleryCategory = (slug: string | undefined) =>
  GALLERY_CATEGORIES.find((c) => c.slug === slug);
