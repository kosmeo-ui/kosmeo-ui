"use client";

import IconButton from "../../../buttons/iconButton/index.js";
import Dropdown from "../../../inputs/dropdown/index.js";
import SortDirection from "./sortDirection.js";
import DeleteButton from "./deleteButton.js";
import SortBy from "./sortBy.js";
import Limit from "./limit.js";
import "./styles.css";
import {
  faDownload,
  faEllipsisVertical,
  faPlus,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import {
  SortDirection as SortDirectionType,
  InfiniteScrollMenuLimitOption,
  InfiniteScrollMenuSortDataKey,
  TableRow,
} from "../types.js";

interface HeaderProps<TData> {
  title: string;
  optionsDropdown?: React.ReactNode;
  onDownload?: () => void;
  limitOptions: InfiniteScrollMenuLimitOption[];
  sortBy: InfiniteScrollMenuSortDataKey[];
  sortDirection?: SortDirectionType;
  rows: TableRow<TData>[];
  selectedRows: Set<number>;
  allSelected: boolean;
  onLimitChange: (limitOptions: InfiniteScrollMenuLimitOption[]) => void;
  onSortByChange: (sortBy: InfiniteScrollMenuSortDataKey[]) => void;
  onSortDirectionChange: (sortDirection: SortDirectionType) => void;
  onAddNew?: () => void;
  onDelete?: (rows: TableRow<TData>[]) => void;
  onRefetch: () => void;
}

const Header = <TData extends object>(props: HeaderProps<TData>) => {
  return (
    <div className="k-infinite-scroll-header">
      <div className="k-infinite-scroll-header-buttons-container">
        <p className="k-infinite-scroll-header-title">{props.title}</p>
        <IconButton
          size="sm"
          variant="secondary"
          onClick={props.onRefetch}
          icon={faRotate}
        />
        {props.onDownload && (
          <IconButton
            size="sm"
            variant="secondary"
            onClick={props.onDownload}
            icon={faDownload}
          />
        )}
        {props.onAddNew && (
          <IconButton
            size="sm"
            variant="success"
            onClick={props.onAddNew}
            icon={faPlus}
          />
        )}
        <DeleteButton<TData>
          rows={props.rows}
          selectedRows={props.selectedRows}
          allSelected={props.allSelected}
          onDelete={props.onDelete}
        />
        {props.optionsDropdown && (
          <Dropdown
            icon={faEllipsisVertical}
            size="sm"
            variant="secondary"
            align="left"
            renderCaret={false}
          >
            {props.optionsDropdown}
          </Dropdown>
        )}
      </div>
      <div className="k-infinite-scroll-header-limit-sort-container">
        <Limit
          limitOptions={props.limitOptions}
          onLimitChange={props.onLimitChange}
        />
        {props.sortBy.length > 0 && (
          <div className="k-infinite-scroll-header-sort-container">
            <p className="k-infinite-scroll-header-sort-title">Sort By:</p>
            <SortBy
              sortBy={props.sortBy}
              handleSortByChange={props.onSortByChange}
            />
            <SortDirection
              sortDirection={props.sortDirection}
              handleSortDirectionChange={props.onSortDirectionChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
