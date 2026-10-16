import RowActions, { RowActionsProps } from "../index.js";
import Table from "../../../data-display/table/index.js";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DataTable, {
  TableColumn,
} from "../../../data-display/dataTable/index.js";

interface Person {
  name: string;
}

describe("RowActions", () => {
  it("renders its actions", () => {
    render(
      <RowActions>
        <button>Edit</button>
        <button>Delete</button>
      </RowActions>
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  // The wrapper is a role-less div whose classes are the contract, reachable
  // only from its actions.
  it.each<[string, Partial<RowActionsProps>, string]>([
    [
      "the defaults",
      {},
      "k-row-actions k-row-actions-center k-row-actions-gap-xs",
    ],
    [
      "start alignment and a small gap",
      { align: "start", gap: "sm" },
      "k-row-actions k-row-actions-start k-row-actions-gap-sm",
    ],
    [
      "end alignment and a medium gap",
      { align: "end", gap: "md" },
      "k-row-actions k-row-actions-end k-row-actions-gap-md",
    ],
  ])("maps %s to classes", (_, props, classes) => {
    render(
      <RowActions {...props}>
        <button>Edit</button>
      </RowActions>
    );

    expect(
      screen.getByRole("button", { name: "Edit" }).parentElement
    ).toHaveClass(classes, { exact: true });
  });

  describe("in a DataTable column with disableRowClick", () => {
    const setup = (onEdit = vi.fn(), onRowClick = vi.fn()) => {
      const columns: TableColumn<Person>[] = [
        { title: "Name", dataKey: "name" },
        {
          title: "Actions",
          disableRowClick: true,
          cellElement: (person) => (
            <RowActions>
              <button onClick={() => onEdit(person)}>Edit {person.name}</button>
            </RowActions>
          ),
        },
      ];
      render(
        <DataTable<Person>
          columns={columns}
          rows={[{ index: 0, data: { name: "Ada" } }]}
          onRowClick={onRowClick}
        />
      );
    };

    it("calls the action", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      setup(onEdit);

      await user.click(screen.getByRole("button", { name: "Edit Ada" }));

      expect(onEdit).toHaveBeenCalledExactlyOnceWith({ name: "Ada" });
    });

    it("does not also click the row", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      setup(vi.fn(), onRowClick);

      await user.click(screen.getByRole("button", { name: "Edit Ada" }));

      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  describe("in a clickable row, without disableRowClick", () => {
    const actionColumn = (onEdit: (person: Person) => void) => ({
      title: "Actions",
      cellElement: (person: Person) => (
        <RowActions>
          <button onClick={() => onEdit(person)}>Edit {person.name}</button>
        </RowActions>
      ),
    });

    it.each([
      [
        "DataTable",
        (onRowClick: () => void) =>
          render(
            <DataTable<Person>
              columns={[actionColumn(vi.fn())]}
              rows={[{ index: 0, data: { name: "Ada" } }]}
              onRowClick={onRowClick}
            />
          ),
      ],
      [
        "Table",
        (onRowClick: () => void) =>
          render(
            <Table<Person>
              columns={[actionColumn(vi.fn())]}
              rows={[{ name: "Ada" }]}
              onRowClick={onRowClick}
            />
          ),
      ],
    ])(
      "keeps an action's click from reaching a %s row",
      async (_, renderIn) => {
        const user = userEvent.setup();
        const onRowClick = vi.fn();
        renderIn(onRowClick);

        await user.click(screen.getByRole("button", { name: "Edit Ada" }));

        expect(onRowClick).not.toHaveBeenCalled();
      }
    );

    it("still calls the action", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <DataTable<Person>
          columns={[actionColumn(onEdit)]}
          rows={[{ index: 0, data: { name: "Ada" } }]}
          onRowClick={vi.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: "Edit Ada" }));

      expect(onEdit).toHaveBeenCalledExactlyOnceWith({ name: "Ada" });
    });
  });
});
