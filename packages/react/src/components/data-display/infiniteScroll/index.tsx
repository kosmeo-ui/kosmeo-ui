"use client";

import LoadingOverlay from "../../feedback/loadingOverlay/index.js";
import * as pendingChangesUtil from "./utils/hasPendingChanges.js";
import generateQueryString from "./utils/generateQueryString.js";
import Button from "../../buttons/button/index.js";
import Col from "../../layout/col/index.js";
import Filters from "./filters/index.js";
import Header from "./header/index.js";
import Table from "./table/index.js";
import Tags from "./tags/index.js";
import "./styles.css";
import {
  TableColumn,
  InfiniteScrollMenu,
  InfiniteScrollMenuGeneratedFilter,
  InfiniteScrollMenuLimitOption,
  TableRow,
} from "./types.js";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_LIMIT_OPTIONS: InfiniteScrollMenuLimitOption[] = [
  { value: 25, selected: true },
  { value: 50, selected: false },
  { value: 100, selected: false },
];

const SCROLL_THRESHOLD = 50;

const menuFilters = (
  menu: InfiniteScrollMenu
): InfiniteScrollMenuGeneratedFilter[] =>
  (menu.filters ?? []).map((f, i) => ({ ...f, filterId: `${f.dataKey}-${i}` }));

interface InfiniteScrollProps<TData> {
  menu: InfiniteScrollMenu;
  /** The data array to be rendered in the infinite scroll */
  data: TData[];
  /** Indicates if there are more items to load */
  hasMore: boolean;
  /** Indicates if data is currently being loaded */
  isLoading: boolean;
  /**
   * Callback function that returns a query string to be attached to the URL when fetching data.
   * Called whenever filters, sort, or limit options change.
   */
  onQueryChange: (queryString: string) => void;
  /** Function that is called to reload the data */
  onReload: () => void;
  /** NOTE: Only columns OR dataComponent is allowed */
  columns?: TableColumn<TData>[];
  /** NOTE: Only dataComponent OR columns is allowed */
  dataComponent?: (data: TableRow<TData>[]) => ReactNode[];
  /** A toggle to tell the Infinite Scroll to fetch more data. Any change will trigger it*/
  reloadData?: boolean;
  /** Returns the data for the rows that are selected */
  onRowSelect?: (data: TableRow<TData>[]) => void;
  /** Function that is called when the "+" button is clicked */
  onAddNew?: () => void;
  /**
   * Function that is called when the delete button is clicked
   *
   * All the rows that are selected will be passed to this function.
   */
  onDelete?: (data: TableRow<TData>[]) => void;
  /**
   * An optional element to render in the options menu.
   *
   * This can be used to add custom actions or buttons to the menu.
   */
  optionsDropdown?: ReactNode;
  /** Callback for a download/export button in the header */
  onDownload?: () => void;
  loadingDataMessage?: string;
  emptyMessage?: string;
  /** Function called when a row is clicked. Receives the row data. */
  onRowClick?: (data: TData) => void;
  /** When true, hides the header, filters, and tags while keeping infinite scroll functionality */
  hideFilters?: boolean;
  /** When true, hides the select/checkbox column */
  hideSelectColumn?: boolean;
  /** When true, hides the "Fetch Next Page" button */
  hideNextPageButton?: boolean;
  /**
   * When filter, sort and page-size changes take effect. `"immediate"`
   * (default) applies each change as it's made: searches wait for a pause in
   * typing, and a range (two bounds in one menu) applies from the menu's own
   * Apply button. `"manual"` collects changes until Apply is clicked. In
   * both, Enter in a filter's text box applies at once.
   */
  applyMode?: "immediate" | "manual";
}

const TYPING_DEBOUNCE_MS = 400;

const InfiniteScroll = <TData extends object>(
  props: InfiniteScrollProps<TData>
) => {
  if (props.columns && props.dataComponent) {
    throw new Error(
      "You cannot use both columns and dataComponent in the same infinite scroll component"
    );
  }

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState(() => menuFilters(props.menu));
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [sortBy, setSortBy] = useState(props.menu.sort?.sortDataKeys || []);
  const [pendingSortBy, setPendingSortBy] = useState(
    props.menu.sort?.sortDataKeys || []
  );
  const [sortDirection, setSortDirection] = useState(
    props.menu.sort?.sortDirection || "desc"
  );
  const [pendingSortDirection, setPendingSortDirection] = useState(
    props.menu.sort?.sortDirection || "desc"
  );
  const [limitOptions, setLimitOptions] = useState(
    props.menu.limitOptions || DEFAULT_LIMIT_OPTIONS
  );
  const [pendingLimitOptions, setPendingLimitOptions] = useState(
    props.menu.limitOptions || DEFAULT_LIMIT_OPTIONS
  );

  const infiniteScrollTableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const rows = useMemo((): TableRow<TData>[] => {
    if (!props.data || props.data.length === 0) return [];
    return props.data.map((each, index) => ({ index, data: each }));
  }, [props.data]);

  const allSelected = useMemo(() => {
    if (rows.length === 0) return false;
    return rows.length === selectedRows.size;
  }, [rows, selectedRows]);

  const getQueryString = useCallback(
    (isNextPage: boolean = false): string => {
      return generateQueryString({
        filters,
        limitOptions,
        sortBy,
        sortDirection,
        dataLength: props.data.length,
        isNextPage,
      });
    },
    [filters, limitOptions, sortBy, sortDirection, props.data.length]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      if (!infiniteScrollTableRef.current || !props.hasMore || props.isLoading)
        return;
      const { scrollHeight, clientHeight } = infiniteScrollTableRef.current;
      const hasVerticalScrollbar = scrollHeight > clientHeight;
      if (!hasVerticalScrollbar) return;
      if (e.target instanceof Element === false) return;
      const scrollPosition = e.target.scrollHeight - e.target.scrollTop;
      if (scrollPosition > SCROLL_THRESHOLD + e.target.clientHeight) return;
      props.onQueryChange(getQueryString(true));
    },
    [props.hasMore, props.isLoading, props.onQueryChange, getQueryString]
  );

  const handleNextPageClick = useCallback(
    () => props.onQueryChange(getQueryString(true)),
    [props.onQueryChange, getQueryString]
  );

  const handleRowSelect = useCallback((index: number) => {
    setSelectedRows((prev) => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(index)) newSelectedRows.delete(index);
      else newSelectedRows.add(index);
      return newSelectedRows;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!allSelected) setSelectedRows(new Set(rows.map((row) => row.index)));
    else setSelectedRows(new Set());
  }, [allSelected, rows]);

  useEffect(() => {
    setSelectedRows(new Set());
  }, [props.data]);

  useEffect(() => {
    if (!props.onRowSelect) return;
    const selectedData = rows.filter((r) => selectedRows.has(r.index));
    props.onRowSelect(selectedData);
  }, [selectedRows, rows, props.onRowSelect]);

  // The menu is plain data: re-apply it when its contents change, not each
  // time it is a new object, or an inline menu or onReload re-renders forever.
  const menuKey = JSON.stringify([
    props.menu.filters,
    props.menu.sort,
    props.menu.limitOptions,
  ]);
  const onReloadRef = useRef(props.onReload);
  onReloadRef.current = props.onReload;
  // The state starts from the mounting menu: applying it again would send a
  // second query, replacing the first one's request.
  const appliedMenuKey = useRef(menuKey);

  useEffect(() => {
    if (menuKey === appliedMenuKey.current) return;
    appliedMenuKey.current = menuKey;
    const generatedFilters = menuFilters(props.menu);
    setFilters(generatedFilters);
    setPendingFilters(generatedFilters);
    const sortDataKeys = props.menu.sort?.sortDataKeys || [];
    const sortDir = props.menu.sort?.sortDirection || "desc";
    setSortBy(sortDataKeys);
    setPendingSortBy(sortDataKeys);
    setSortDirection(sortDir);
    setPendingSortDirection(sortDir);
    const limits = props.menu.limitOptions || DEFAULT_LIMIT_OPTIONS;
    setLimitOptions(limits);
    setPendingLimitOptions(limits);
    onReloadRef.current();
  }, [menuKey]);

  useEffect(() => {
    const queryString = generateQueryString({
      filters,
      limitOptions,
      sortBy,
      sortDirection,
      dataLength: 0,
      isNextPage: false,
    });
    props.onQueryChange(queryString);
  }, [
    sortBy,
    sortDirection,
    limitOptions,
    filters,
    props.reloadData,
    props.onQueryChange,
  ]);

  const hasPendingChanges = useMemo(
    () =>
      pendingChangesUtil.hasPendingChanges({
        filters,
        pendingFilters,
        sortBy,
        pendingSortBy,
        sortDirection,
        pendingSortDirection,
        limitOptions,
        pendingLimitOptions,
      }),
    [
      filters,
      pendingFilters,
      sortBy,
      pendingSortBy,
      sortDirection,
      pendingSortDirection,
      limitOptions,
      pendingLimitOptions,
    ]
  );

  // Reset clears what's applied as well as what's pending, so it stays
  // available while the table is filtered even if the pending edits are empty.
  const hasActiveFilters = useMemo(
    () =>
      pendingChangesUtil.hasActiveFilters(pendingFilters) ||
      pendingChangesUtil.hasActiveFilters(filters),
    [pendingFilters, filters]
  );

  const handleApply = useCallback(() => {
    setFilters(pendingFilters);
    setSortBy(pendingSortBy);
    setSortDirection(pendingSortDirection);
    setLimitOptions(pendingLimitOptions);
  }, [
    pendingFilters,
    pendingSortBy,
    pendingSortDirection,
    pendingLimitOptions,
  ]);

  const applyMode = props.applyMode ?? "immediate";

  // Immediate mode applies pending changes on the next tick, or once typing
  // pauses. Each keystroke changes handleApply, which restarts the timer.
  useEffect(() => {
    if (applyMode !== "immediate" || !hasPendingChanges) return;
    const delay = pendingChangesUtil.hasTypedFilterChanges(
      filters,
      pendingFilters
    )
      ? TYPING_DEBOUNCE_MS
      : 0;
    const timer = setTimeout(handleApply, delay);
    return () => clearTimeout(timer);
  }, [applyMode, hasPendingChanges, handleApply, filters, pendingFilters]);

  // Tags show the applied filters, and removing one applies at once. The
  // pending copy of that filter follows; other pending edits are kept.
  const handleTagChange = useCallback(
    (next: InfiniteScrollMenuGeneratedFilter[]) => {
      setPendingFilters((pending) =>
        pending.map((p, i) => (next[i] !== filters[i] ? next[i] : p))
      );
      setFilters(next);
    },
    [filters]
  );

  const handleReset = useCallback(() => {
    const clearedFilters = pendingChangesUtil.clearFilters(pendingFilters);
    setPendingFilters(clearedFilters);
    setFilters(clearedFilters);
  }, [pendingFilters]);

  return (
    <div ref={containerRef} className="k-infinite-scroll-container">
      {!props.hideFilters && (
        <>
          <Col size="sm">
            <Header<TData>
              title={props.menu.title}
              limitOptions={pendingLimitOptions}
              sortBy={pendingSortBy}
              sortDirection={pendingSortDirection}
              rows={rows}
              selectedRows={selectedRows}
              allSelected={allSelected}
              optionsDropdown={props.optionsDropdown}
              onDownload={props.onDownload}
              onAddNew={props.onAddNew}
              onDelete={props.onDelete}
              onRefetch={props.onReload}
              onLimitChange={setPendingLimitOptions}
              onSortByChange={setPendingSortBy}
              onSortDirectionChange={setPendingSortDirection}
            />
            <Filters
              pendingFilters={pendingFilters}
              handleNewPendingFilters={setPendingFilters}
              onApply={hasPendingChanges ? handleApply : undefined}
              rangeApplyInMenu={applyMode === "immediate"}
            >
              <Button
                size="sm"
                variant="danger"
                disabled={!hasActiveFilters}
                onClick={handleReset}
              >
                Reset
              </Button>
              {applyMode === "manual" && (
                <Button
                  size="sm"
                  disabled={!hasPendingChanges}
                  onClick={handleApply}
                >
                  Apply
                </Button>
              )}
            </Filters>
            <Tags filters={filters} handleNewFilters={handleTagChange} />
          </Col>
          <div className="k-infinite-scroll-menu-table-divider" />
        </>
      )}
      <div
        ref={infiniteScrollTableRef}
        className="k-infinite-scroll-table-container"
        role="region"
        aria-label={props.menu.title}
        onScroll={handleScroll}
      >
        {props.columns && (
          <Table<TData>
            columns={props.columns}
            rows={rows}
            selectedRows={selectedRows}
            allSelected={allSelected}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            onRowClick={props.onRowClick}
            hideSelectColumn={props.hideSelectColumn}
            scrollParentRef={infiniteScrollTableRef}
          />
        )}
        {props.dataComponent && props.dataComponent(rows)}
        {!props.isLoading && props.data.length === 0 && (
          <div className="k-infinite-scroll-empty-state">
            {props.emptyMessage || "No results found"}
          </div>
        )}
        {!props.hideNextPageButton && props.data.length > 0 && (
          <div className="k-infinite-scroll-next-page-container">
            <Button
              disabled={!props.hasMore || props.isLoading}
              onClick={handleNextPageClick}
            >
              {props.hasMore
                ? props.isLoading
                  ? "Loading..."
                  : "Fetch Next Page"
                : "No More Pages"}
            </Button>
          </div>
        )}
        <LoadingOverlay
          fullPage={false}
          show={props.isLoading && props.data.length === 0}
          message={props.loadingDataMessage || "Loading Data..."}
        />
      </div>
    </div>
  );
};

export default InfiniteScroll;

export type {
  InfiniteScrollMenu,
  InfiniteScrollMenuFilter,
  InfiniteScrollMenuSort,
  InfiniteScrollMenuSortDataKey,
  InfiniteScrollMenuLimitOption,
} from "./types.js";
