## 0.3.0 (2026-10-16)

### 🚀 Features

- MultiSelect is accessible: its trigger is a combobox named by the field label, Enter/Space/ArrowDown open it, the options are a multi-select listbox navigable with the arrow keys and Enter, and Escape closes it and returns focus. Input accepts `aria-label`, `aria-controls` and `aria-activedescendant`. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- Typeahead is an ARIA combobox: its input reports the open state and the highlighted option, and the suggestions are a listbox named by the field label. Input accepts `role="combobox"`, `aria-expanded` and `aria-autocomplete`. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))

### 🩹 Fixes

- RichTextEditor no longer crashes when server-rendered or under Next.js: the editor is created after mount, and the toolbar stays disabled until it exists. MultiSelect keys its chips and options by value (or label), so they keep their DOM and focus across renders, and they reflect the latest `disabled` and `onChange`. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- MultiSelect closes its dropdown when focus moves outside it, such as on Tab. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- The required asterisk is hidden from assistive tech, so field names no longer end in "*". RadioGroup is a named `radiogroup` with `aria-required` and required radios, CheckboxGroup is a named `group` whose name says when it's required, and a required RichTextEditor sets `aria-required`. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- SearchList is an ARIA combobox: its input reports the open state and the highlighted option, results are a listbox named by the field label, and prompts are status messages. The keyboard only reaches results on screen, never ones hidden behind the loading spinner, and the highlight resets as the search changes. The `id` prop now reaches the input. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- A Badge that is both clickable and removable renders its action and remove buttons side by side, instead of a button inside a button (invalid HTML, and a hydration error). ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- RichTextEditor no longer calls `onChange` when its `value` prop changes: syncing an outside value isn't an edit. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- Typeahead with `showAll` and `lazyLoad` loads more options as the list scrolls, instead of stopping at the first page. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- `useInfiniteCursor` and `useInfiniteArchivableCursor` send one request when the next page is asked for again before the first arrives, instead of cancelling and resending it. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- SearchList works without a `value` prop: it keeps track of the pick itself, so the list stays closed after a selection and blur restores the picked label. Passing `value` (or `null`) keeps it controlled, as before. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- Unit tests (Vitest + Testing Library) for hooks and core components; test files are kept out of dist and the published tarball. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- Input, TextArea, Select, Checkbox, Switch, MultiSelect, FileUpload and RichTextEditor generate their default `id` with `useId`, so it stays stable across renders and matches between server and client. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))

### ❤️ Thank You

- Cameron Perera
- Claude Opus 5.5

## 0.2.0 (2026-10-15)

### 🚀 Features

- Add `confirmationText` to ConfirmationModal: when set, the user must type that text exactly before the confirm button enables. Enter confirms once it matches. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Modal and ConfirmationModal now close when the backdrop is clicked, as well as on Escape. Pass `dismissible={false}` to turn both off, so only the modal's own buttons close it. ConfirmationModal is not dismissible while `isLoading`, matching its disabled Cancel button. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Add `onClear` to Input: a non-empty field shows an × button (labelled "Clear") that calls it and returns focus to the field. InfiniteScroll's search filters use it, and no longer show a tag duplicating the search text. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Accessibility (Lighthouse/axe, both themes). New tokens --primary-color-text, --danger-color-text and --warning-color-contrast for text that must clear 4.5:1; secondary, dark-theme success and light-theme alert backgrounds darkened so white text passes; --text-color-link darkened. Opacity-faded text in EmptyState, AddressBlock and RecoveryCodeGrid now uses --text-color-secondary. New props: BorderedSection `as` (heading level), Checkbox and Dropdown `aria-label`, Button `aria-pressed`. Accessible names for loading Buttons, dropdown arrows, MultiSelect chips, RichTextEditor toolbar and editing area, and InfiniteScroll's icon buttons and row checkboxes. Date inputs link their labels; TagCard uses list items; Input addons are no longer aria-hidden; PhoneInput's country button name matches its visible text; the password toggle has a 24px target. .k-sr-only moves to the global stylesheet. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Add Pagination (numbered pages with gaps, previous/next, optional "51–75 of 240" summary and rows-per-page picker) and usePaginated (one page at a time from a limit/offset endpoint returning { data, total }; keeps the previous page visible while loading and returns to page 1 when filters change). InfiniteScroll and useInfiniteCursor are unchanged. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Add `readOnly` to Input and Checkbox. Unlike `disabled`, a read-only field stays focusable and readable by screen readers; Checkbox sets `aria-readonly` and blocks toggling, since browsers ignore `readonly` on checkboxes. Checkbox's `onChange` is now optional. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))

### 🩹 Fixes

- InfiniteScroll's applied-filter tags now render as Badges (e.g. "Status: Active") with an × to remove the filter, instead of the two-line blue tag. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- InfiniteScroll's SEARCH filters are now a labelled text input in the filter bar instead of a dropdown with an "Add Filter" button. Typing updates the pending filter; Apply applies it, like the other filters. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Sidebar: group labels now meet WCAG AA contrast (white at 50% instead of 20%, about 5:1 instead of 1.9:1 on the dark sidebar), and nav links get a visible white focus ring. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Contrast fixes for WCAG AA: SectionHeader subtitles use --text-color-secondary instead of 65% opacity; subtle Badge text mixes the variant color with --text-color (warning uses --warning-color-text); ProgressBar shows its percentage beside the bar in --text-color instead of on the fill, and now shows 0% too. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Card padding="none" clips its content to the rounded corners, pads its header and footer, and drops a direct child Table's duplicate outer border. Table cells get more horizontal padding (1rem at the outer edges); DataTable's leading checkbox column keeps even padding. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- RowActions no longer shrinks its actions: in a narrow table cell, squeezed icon buttons collapsed their icons to zero width. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- InfoRow labels use --text-color-secondary instead of 70% opacity text. ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))
- Center the selection checkbox in DataTable's leading column (InfiniteScroll's select column). ([#4](https://github.com/kosmeo-ui/kosmeo-ui/pull/4))

### ❤️ Thank You

- Cameron Perera @cameronperera-vivo
- Claude Opus 5.5

## 0.1.1 (2026-10-13)

### 🩹 Fixes

- The npm page shows the kosmeo banner. ([#2](https://github.com/kosmeo-ui/kosmeo-ui/pull/2))

### ❤️ Thank You

- Aaron Leman
- Claude Opus 5.5