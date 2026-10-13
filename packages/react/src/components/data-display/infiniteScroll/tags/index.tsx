import { InfiniteScrollMenuGeneratedFilter } from "../types";
import SearchFilterTag from "./searchFilterTag";
import SelectFilterTag from "./selectFilterTag";
import RangeFilterTag from "./rangeFilterTag";
import ListFilterTag from "./listFilterTag";
import "./styles.css";

interface InfiniteScrollMenuTagsProps {
  filters: InfiniteScrollMenuGeneratedFilter[];
  handleNewFilters: (filters: InfiniteScrollMenuGeneratedFilter[]) => void;
}

const Tags = (props: InfiniteScrollMenuTagsProps) => {
  const filterTags = props.filters.reduce((tags, f) => {
    if (f.type === "SELECT") {
      const selectedFilters = f.options?.filter((o) => o.selected);
      if (!selectedFilters) return tags;
      for (const selectedFilter of selectedFilters) {
        tags.push(
          <SelectFilterTag
            key={f.filterId}
            filter={f}
            filterOption={selectedFilter}
            filters={props.filters}
            handleNewFilters={props.handleNewFilters}
          />
        );
      }
    } else if (f.type === "RANGE") {
      if (f.startValue) {
        tags.push(
          <RangeFilterTag
            key={f.filterId}
            filter={f}
            filters={props.filters}
            filterValue="startValue"
            handleNewFilters={props.handleNewFilters}
          />
        );
      }
      if (f.endValue) {
        tags.push(
          <RangeFilterTag
            key={f.filterId}
            filter={f}
            filters={props.filters}
            filterValue="endValue"
            handleNewFilters={props.handleNewFilters}
          />
        );
      }
    } else if (f.type === "SEARCH") {
      if (!f.value) return tags;
      tags.push(
        <SearchFilterTag
          key={f.filterId}
          filter={f}
          filters={props.filters}
          handleNewFilters={props.handleNewFilters}
        />
      );
    } else if (f.type === "LIST") {
      if (!f.list) return tags;
      tags.push(
        <ListFilterTag
          key={f.filterId}
          filter={f}
          filters={props.filters}
          handleNewFilters={props.handleNewFilters}
        />
      );
    }
    return tags;
  }, [] as React.ReactNode[]);

  if (!filterTags.length) return null;
  return <div className="tags-container">{filterTags}</div>;
};

export default Tags;
