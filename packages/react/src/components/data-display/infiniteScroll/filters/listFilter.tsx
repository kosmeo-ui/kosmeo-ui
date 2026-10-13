import { useCallback, useEffect, useMemo, useState } from "react";
import { faList } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "../../../inputs/dropdown";
import Button from "../../../buttons/button";
import Input from "../../../inputs/input";
import "./styles.css";
import {
  GeneratedListFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../types";

interface InfiniteScrollListFilterProps {
  filter: GeneratedListFilter;
  onFilterChange: (filter: InfiniteScrollMenuGeneratedFilter) => void;
}

const ListFilter = (props: InfiniteScrollListFilterProps) => {
  const [list, setList] = useState<string>("");
  const [prevList, setPrevList] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (
      props.filter.list === prevList ||
      (props.filter.list === undefined && prevList === "")
    )
      return;
    setList(props.filter.list || "");
    setPrevList(props.filter.list || "");
    return;
  }, [props.filter.list, list, prevList]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setList(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    props.onFilterChange({ ...props.filter, list: list });
    setIsOpen(false);
  }, [list, props]);

  const handleKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

  const allowSubmit = useMemo(() => {
    return list !== prevList;
  }, [list, prevList]);

  return (
    <Dropdown
      size="sm"
      variant="secondary"
      label={props.filter.title}
      align="left"
      icon={faList}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="filter-menu">
        <Input
          size="sm"
          value={list}
          onChange={handleChange}
          type="text"
          onKeyDown={handleKeydown}
        />
        <Button size="sm" disabled={!allowSubmit} onClick={handleSubmit}>
          Add Filter
        </Button>
      </div>
    </Dropdown>
  );
};

export default ListFilter;
