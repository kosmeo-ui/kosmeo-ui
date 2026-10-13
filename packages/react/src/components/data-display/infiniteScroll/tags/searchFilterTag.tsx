import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../../../buttons/iconButton";
import { useCallback } from "react";
import "./styles.css";
import {
  GeneratedSearchFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../types";

interface InfiniteScrollSearchFilterTagProps {
  filter: GeneratedSearchFilter;
  filters: InfiniteScrollMenuGeneratedFilter[];
  handleNewFilters: (filters: InfiniteScrollMenuGeneratedFilter[]) => void;
}

const SearchFilterTag = (props: InfiniteScrollSearchFilterTagProps) => {
  const handleRemove = useCallback(() => {
    const newFilters = props.filters?.map((f) => {
      if (f.filterId !== props.filter.filterId) return f;
      if (f.type !== "SEARCH") return f;
      return { ...f, value: "" };
    });
    props.handleNewFilters(newFilters);
  }, [props.filters, props.filter]);

  return (
    <div className="tag-container">
      <p className="tag-title">{props.filter.title}</p>
      <div className="tag-actions">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <p className="tag-value">{props.filter.value}</p>
        <IconButton icon={faXmark} onClick={handleRemove} size="sm" />
      </div>
    </div>
  );
};

export default SearchFilterTag;
