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