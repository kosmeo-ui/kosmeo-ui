# 1.0.0 (2026-10-19)

### 🚀 Features

- MultiSelect is accessible: its trigger is a combobox named by the field label, Enter/Space/ArrowDown open it, the options are a multi-select listbox navigable with the arrow keys and Enter, and Escape closes it and returns focus. Input accepts `aria-label`, `aria-controls` and `aria-activedescendant`. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- Typeahead is an ARIA combobox: its input reports the open state and the highlighted option, and the suggestions are a listbox named by the field label. Input accepts `role="combobox"`, `aria-expanded` and `aria-autocomplete`. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- useInfinite, useInfiniteCursor and useInfiniteArchivableCursor default to a page size of 25, InfiniteScroll's default, so a list no longer makes a wasted 10-row request on mount. Apps that relied on the old default of 10 can pass `initialLimit: 10`. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- useInfinite, useInfiniteCursor and useInfiniteArchivableCursor return `error` (the failed request's error, or null), so an app can tell a failed load from an empty list. After a failure they report `hasMore: false`, so InfiniteScroll stops asking for pages until `reload()` succeeds. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))

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
- MultiSelect's chip remove buttons are labelled ("Remove …") again, so tests and tooling can find them by label. They stay hidden from assistive tech and out of the tab order; keyboard and screen-reader users deselect from the listbox. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- Accessible names: InfiniteScroll's scroll region, header dropdowns ("Results per page", "Sort by", "Sort direction"), range, list and option-search fields and list-tag modal controls; ColorPicker's and FileUpload's labels now point at their inputs; FileUpload's remove buttons and PhoneInput's country search are named. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- Table and DataTable now render a column whose dataKey uses bracket notation, such as "tags[1]" or "pets[0].name", instead of throwing. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- DataTable now leaves out a column marked `hidden: true`, as Table does. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- PhoneInput now keeps the country code of a pasted international number, such as "+44 20 7183 8750", and switches its country picker to match, instead of reporting it under the selected country. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- PhoneInput now shows a value that belongs to no specific country, such as "+15555555555", in national form ("(555) 555-5555") as it was typed. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- PhoneInput now empties its field when the parent sets `value` back to "" after passing in a number. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- PhoneInput no longer keeps a pasted number's country code as part of the number when another country is chosen. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- ColorPicker's `required` now marks its hex field required, for form validation and assistive tech, not only with an asterisk. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- A controlled Dropdown no longer calls `onOpenChange(false)` on every click outside it while it is already closed. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- SearchSelect now clears its keyboard highlight as the user types, so ArrowUp and Enter pick an option after the list shrinks. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- SearchSelect now stays open with its typed text when focus leaves and returns quickly, instead of closing a moment later. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- With several FileDropZones on a page, each "Browse Files" button now opens its own zone's file picker. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- InfiniteScroll no longer triggers React duplicate-key warnings when a filter shows several tags, such as two selected options or both ends of a range. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- Clearing a number range filter in InfiniteScroll now removes that bound from the query instead of sending NaN. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- InfiniteScroll no longer sends an empty range filter parameter (such as `filter[price_gte]=`) for a range field the user has emptied. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- InfiniteScroll now shows a tag for, and enables Reset on, a range filter bound of 0. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- InfiniteScroll no longer enables Apply after a filter field is typed into and emptied again with nothing to apply. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- An InfiniteScroll range filter with no `rangeType` now shows its value in its tag instead of a blank. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- In InfiniteScroll's list filter editor, a row's remove button now removes only that value instead of clearing the whole list. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- Table and DataTable show an em dash (—) in a dataKey cell with no value — null, an empty string, or a field missing from the row — instead of an empty cell or, for a missing field, crashing the table. dataKey paths also accept consecutive indexes (`grid[0][1]`). ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- A click on a RowActions action no longer also triggers the clickable row around it (Table and DataTable onRowClick), with or without disableRowClick on its column. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- A ColorSwatch without a `title` is named, and tooltipped, by its colour value instead of being an unnamed image. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- FileUpload shows sizes of 1 TB and above in TB (in the file list and the size-limit dialog) instead of "undefined". ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- FileUpload empties its input when it rejects an oversized pick, so a native form submission or `required` check never sees the rejected file. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- TagCard renders repeated tags as given, without React's duplicate-key error or mis-rendered tags when the list changes. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- LanguageSelect no longer replaces a stored language it doesn't list when it loads: a bare language ("en") shows as its first locale (English (United States)) and any other code shows as itself, and onChange fires only when the user picks. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- FileUpload's fileListPosition works: with the built-in file list, the upload controls stay on screen once files are chosen (as "Change File(s)"), and the list sits above or below them. The list header keeps its count and Clear All; a custom renderFiles is unchanged. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- FileUpload's Upload, Change and Upload Folder controls are real buttons, so keyboard and screen-reader users can reach and use them; they were labels styled as buttons. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- InfiniteScroll no longer loops forever (thousands of requests) when an app passes `menu` or `onReload` inline: it re-applies the menu only when its contents change, keeps the user's filters across re-renders, applies a new sort or page size from a menu without filters, and calls onReload only when the menu changes after mount. ([#8](https://github.com/kosmeo-ui/kosmeo-ui/pull/8))
- Unit tests (Vitest + Testing Library) for hooks and core components; test files are kept out of dist and the published tarball. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))
- Input, TextArea, Select, Checkbox, Switch, MultiSelect, FileUpload and RichTextEditor generate their default `id` with `useId`, so it stays stable across renders and matches between server and client. ([#6](https://github.com/kosmeo-ui/kosmeo-ui/pull/6))

### ⚠️  Breaking Changes

- Breaking: every CSS variable is now `--k-` prefixed (`--primary-color` → `--k-primary-color`, `--text-size-sm` → `--k-text-size-sm`, and so on), so the theme can't collide with an app's own variables. Apps that override or read theme tokens must rename them. ([#9](https://github.com/kosmeo-ui/kosmeo-ui/pull/9))

  Styles that referenced undefined variables now resolve. New tokens `--k-background-color-disabled`, `--k-text-color-disabled`, `--k-border-color-disabled` and `--k-border-color-hover` (both themes) style disabled Input, TextArea, Select, MultiSelect, Checkbox and Switch, and Select's hover border. DataTable clickable-row hover, FileUpload's list surfaces, FileDropZone's drag highlight, PhoneInput's option hover, and InfiniteScroll/FileUpload muted text now use existing tokens.

  Table and DataTable headers follow their column's `align` (left by default) instead of always centering, so they line up with the cells. Subtle Badges tint over a translucent background with a faint outline, so they stay visible on striped rows and dark surfaces. InfiniteScroll SELECT filter options are checkboxes (announced with their checked state) rather than buttons.

  MultiSelect's Select all / Clear all buttons no longer shrink to a sliver next to the search input. Select uses the customizable `<select>` picker (`appearance: base-select`) where the browser supports it, so the menu opens below the field in the theme's colors instead of wherever the OS places it; other browsers keep the native picker.

  The theme sets `color-scheme` (`light` on `:root`, `dark` under `[data-theme="dark"]`), so native controls — date/time picker icons, checkboxes, scrollbars, the select picker — render for the active theme instead of always light. Tooltip text uses `--k-background-color` against its inverted surface, so it's readable on the dark theme.

  DateInput and DateTimeInput read a date-only `value` (`"2026-10-14"`) as that local calendar day. It was parsed as UTC midnight, so anywhere west of UTC the field showed the day before.

  Breaking: DateInput's `onChange` fires with the picked calendar day as `yyyy-mm-dd` (or `null`) instead of an ISO timestamp of local midnight, which carried the user's timezone into what is a plain date. DateTimeInput still returns an ISO timestamp.

  FormGrid keeps controls in a row level when one label wraps or one field shows helper or error text: fields share label, control and message rows through CSS subgrid.

  Spinner no longer squashes into an oval in a short or narrow flex container (as during a first layout): it keeps its size instead of shrinking. Keyframes are `k-` prefixed (`k-spin`, `k-fade-in`, `k-fade-out`, `k-scale-in`, `k-scale-out`), so an app's own `@keyframes spin` or `fadeIn` can't replace the library's animations.

  InfiniteScroll filters: tags show the applied filters (not pending edits) and removing one applies at once; Enter in a filter's text, number or date box applies; Reset stays available while applied filters are active. Clearing a DATE range bound no longer throws.

  Breaking: a DATE range filter sends the picked day as `yyyy-mm-dd` (`filter[signedUp_gte]=2025-10-02`) instead of local midnight as a UTC timestamp, which excluded the start day for date-only fields and shifted the day for servers in other zones. DATETIME ranges still send ISO timestamps.

  Breaking: InfiniteScroll applies filter, sort and page-size changes as they are made (`applyMode="immediate"`, the new default): option picks and sort apply at once, search boxes wait for a 400ms pause in typing, and range filters (MRR, a date range: two bounds in one menu) keep edits as a draft until the Apply button in their menu, or Enter, so both bounds can be typed before anything is fetched; closing the menu drops the draft. There is no Apply button in this mode; Reset remains. `applyMode="manual"` keeps the Apply flow. Enter in a filter's text box applies at once in both modes.

  New `TableFilters`: InfiniteScroll's filter bar on its own (search, select, range and list filters with tags and Reset, and the same `applyMode`), for tables that page with `usePaginated` or load another way. It reports the applied filters as `filter[...]` params to spread into `usePaginated`'s `params`, in the same format InfiniteScroll sends.

  Dropdown arrows are centered vertically: the chevron in MultiSelect and in Input's dropdown mode (SearchSelect, Typeahead) was pinned a fixed distance from the top, so it sat high, and higher still as MultiSelect grew with chips. Where the customizable `<select>` is supported, Select shows the same chevron (centered, flips when open) instead of the browser's filled triangle.

  A `Page` with both `fillHeight` and `padded` keeps its bottom padding when its content is taller than the page: the content used to spill past the fixed-height page and end flush with the bottom of the view. Page's padding and gap are now set through `--k-page-padding` and `--k-page-gap`.

  TableFilters compares its `filters` by contents, as InfiniteScroll now does its `menu`, so an inline array keeps the user's filters across re-renders.

### ❤️ Thank You

- Cameron Perera @cameronperera-vivo
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