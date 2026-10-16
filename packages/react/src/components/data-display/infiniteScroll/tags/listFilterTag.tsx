"use client";

import IconButton from "../../../buttons/iconButton/index.js";
import type { TableColumn } from "../../dataTable/types.js";
import Table from "../../../data-display/table/index.js";
import { useCallback, useMemo, useState } from "react";
import Badge from "../../../feedback/badge/index.js";
import Modal from "../../../overlays/modal/index.js";
import Input from "../../../inputs/input/index.js";
import Row from "../../../layout/row/index.js";
import "./styles.css";
import {
  faPenToSquare,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  GeneratedListFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../types.js";

interface InfiniteScrollListFilterTagProps {
  filter: GeneratedListFilter;
  filters: InfiniteScrollMenuGeneratedFilter[];
  handleNewFilters: (filters: InfiniteScrollMenuGeneratedFilter[]) => void;
}

const ListFilterTag = (props: InfiniteScrollListFilterTagProps) => {
  const [show, setShow] = useState(false);
  const [modalFilter, setModalFilter] = useState<string>("");
  const [modalAddValues, setModalAddValues] = useState<string>("");

  const handleRemove = useCallback(() => {
    const newFilters = props.filters?.map((f) => {
      if (f.type !== "LIST") return f;
      if (f.filterId !== props.filter.filterId) return f;
      if (!modalAddValues) return { ...f, list: "" };
      const newValues = f.list.split(",").filter((v) => v !== modalAddValues);
      return { ...f, list: newValues.join(",") };
    });
    props.handleNewFilters(newFilters);
  }, [props.filters, props.filter.filterId, modalAddValues]);

  const handleAddValues = () => {
    const newFilters = props.filters?.map((f) => {
      if (f.type !== "LIST") return f;
      if (f.filterId !== props.filter.filterId) return f;
      const newValues = f.list.split(",");
      for (const value of modalAddValues.split(",")) {
        if (!newValues.includes(value)) newValues.push(value);
      }
      return { ...f, list: newValues.join(",") };
    });
    props.handleNewFilters(newFilters);
  };

  const handleClose = () => setShow(false);

  const tagValue = useMemo(() => {
    const allValues = props.filter.list.split(",");
    if (allValues.length > 1) {
      return `${allValues[0]} (+${allValues.length - 1} more)`;
    } else return `${allValues[0]}`;
  }, [props.filter.list]);

  const allowAdd = useMemo(() => {
    if (modalAddValues === "") return false;
    const allValues = props.filter.list.split(",");
    if (allValues.includes(modalAddValues)) return false;
    return true;
  }, [modalAddValues, props.filter.list]);

  const tableRows = useMemo(
    () =>
      props.filter.list.split(",").filter((l) => {
        if (!modalFilter) return true;
        return l.includes(modalFilter);
      }),
    [props.filter.list, modalFilter]
  );

  const tableColumns = useMemo<TableColumn<string>[]>(
    () => [
      {
        title: "#",
        headerElement: (t) => (
          <span className="k-lft-modal-table-header">{t}</span>
        ),
        cellElement: (_, i) => i + 1,
      },
      { title: "Value", cellElement: (value) => value },
      {
        title: "Remove",
        headerElement: (t) => (
          <span className="k-lft-modal-table-header">{t}</span>
        ),
        cellElement: (value) => (
          <div className="k-lft-modal-table-remove-button">
            <IconButton
              icon={faXmark}
              size="sm"
              variant="danger"
              onClick={handleRemove}
              aria-label={`Remove ${value}`}
            />
          </div>
        ),
      },
    ],
    [handleRemove]
  );

  return (
    <div className="k-lft-buttons">
      <Badge onRemove={handleRemove}>
        {props.filter.title}: {tagValue}
      </Badge>
      <IconButton
        icon={faPenToSquare}
        onClick={() => setShow(!show)}
        size="sm"
        variant="light"
        aria-label={`Edit ${props.filter.title}`}
      />
      <Modal show={show} onClose={handleClose} title={props.filter.title}>
        <div className="k-lft-modal-body">
          <Input
            size="sm"
            placeholder="Search"
            aria-label="Search values"
            value={modalFilter}
            onChange={(e) => setModalFilter(e.target.value)}
          />
          <Row size="sm">
            <Input
              size="sm"
              placeholder="Add new values"
              aria-label="Add new values"
              value={modalAddValues}
              onChange={(e) => setModalAddValues(e.target.value)}
            />
            <IconButton
              size="sm"
              icon={faPlus}
              disabled={!allowAdd}
              onClick={handleAddValues}
              aria-label="Add values"
            />
          </Row>
          <div className="k-lft-modal-table-container">
            <Table<string>
              striped
              bordered
              hover
              columns={tableColumns}
              rows={tableRows}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListFilterTag;
