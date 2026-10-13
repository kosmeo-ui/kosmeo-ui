import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TableColumn } from "../../dataTable/types";
import { useCallback, useMemo, useState } from "react";
import IconButton from "../../../buttons/iconButton";
import Table from "../../../data-display/table";
import Modal from "../../../overlays/modal";
import Input from "../../../inputs/input";
import Row from "../../../layout/row";
import "./styles.css";
import {
  faList,
  faPenToSquare,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  GeneratedListFilter,
  InfiniteScrollMenuGeneratedFilter,
} from "../types";

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
          <span className="lft-modal-table-header">{t}</span>
        ),
        cellElement: (_, i) => i + 1,
      },
      { title: "Value", cellElement: (value) => value },
      {
        title: "Remove",
        headerElement: (t) => (
          <span className="lft-modal-table-header">{t}</span>
        ),
        cellElement: () => (
          <div className="lft-modal-table-remove-button">
            <IconButton
              icon={faXmark}
              size="sm"
              variant="danger"
              onClick={handleRemove}
            />
          </div>
        ),
      },
    ],
    [handleRemove]
  );

  return (
    <div className="tag-container">
      <p className="tag-title">{props.filter.title}</p>
      <div className="tag-actions">
        <FontAwesomeIcon icon={faList} />
        <p className="tag-value">{tagValue}</p>
        <div className="lft-buttons">
          <IconButton
            icon={faPenToSquare}
            onClick={() => setShow(!show)}
            size="sm"
          />
          <IconButton icon={faXmark} onClick={handleRemove} size="sm" />
        </div>
      </div>
      <Modal show={show} onClose={handleClose} title={props.filter.title}>
        <div className="lft-modal-body">
          <Input
            size="sm"
            placeholder="Search"
            value={modalFilter}
            onChange={(e) => setModalFilter(e.target.value)}
          />
          <Row size="sm">
            <Input
              size="sm"
              placeholder="Add new values"
              value={modalAddValues}
              onChange={(e) => setModalAddValues(e.target.value)}
            />
            <IconButton
              size="sm"
              icon={faPlus}
              disabled={!allowAdd}
              onClick={handleAddValues}
            />
          </Row>
          <div className="lft-modal-table-container">
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
