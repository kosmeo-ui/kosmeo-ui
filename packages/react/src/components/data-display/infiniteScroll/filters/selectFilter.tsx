import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useMemo, useState } from "react";
import IconButton from "../../../buttons/iconButton";
import Dropdown from "../../../inputs/dropdown";
import Input from "../../../inputs/input";
import "./styles.css";
import {
  faCheckSquare,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  GeneratedSelectFilter,
  InfiniteScrollMenuFilterOption,
  InfiniteScrollMenuGeneratedFilter,
} from "../types";

interface InfiniteScrollSelectFilterProps {
  filter: GeneratedSelectFilter;
  onFilterChange: (filter: InfiniteScrollMenuGeneratedFilter) => void;
}

const SelectFilter = (props: InfiniteScrollSelectFilterProps) => {
  const [options, setOptions] = useState<InfiniteScrollMenuFilterOption[]>([]);
  const [optionSearch, setOptionSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (
      props.filter.options === undefined ||
      props.filter.options === options
    ) {
      return;
    }
    setOptions(props.filter.options || []);
    return;
  }, [props.filter.options, options]);

  const handleSelect = (id: string | number, selected: boolean) => {
    const newOptions = options.map((item) => {
      if (item.id === id) return { ...item, selected };
      else
        return {
          ...item,
          selected: props.filter.multiSelect ? item.selected : false,
        };
    });
    setOptions(newOptions);
    props.onFilterChange({ ...props.filter, options: newOptions });
    // Close dropdown for single-select mode
    if (!props.filter.multiSelect) {
      setIsOpen(false);
    }
  };

  const handleSearchOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionSearch(e.target.value);
  };

  const optionComponents = useMemo(() => {
    const available = options.filter((item) => {
      if (optionSearch === "") return true;
      return item.name.toLowerCase().includes(optionSearch.toLowerCase());
    });
    return available.map((item, index) => (
      <IconButton
        size="sm"
        variant="light"
        align="left"
        shadow={false}
        key={index}
        onClick={() => handleSelect(item.id, !item.selected)}
        icon={item.selected ? faCheckSquare : faSquare}
      >
        {item.name}
      </IconButton>
    ));
  }, [options, optionSearch]);

  return (
    <Dropdown
      size="sm"
      variant="secondary"
      icon={faSquareCheck}
      align="left"
      label={props.filter.title}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="filter-menu select-filter-menu">
        <Input
          size="sm"
          placeholder="Search"
          value={optionSearch}
          onChange={handleSearchOption}
        />
        <div className="select-filter-menu-options">{optionComponents}</div>
      </div>
    </Dropdown>
  );
};

export default SelectFilter;
