import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import DataTable, {
  DataTableProps,
  TableColumn,
  TableLeadingColumn,
  TableRow,
} from "../index.js";

interface Person {
  name: string;
  city: string;
  address: { city: string };
  tags: string[];
  pets: { name: string }[];
}

const ada: Person = {
  name: "Ada",
  city: "London",
  address: { city: "Paris" },
  tags: ["math", "code"],
  pets: [{ name: "Rex" }],
};
const alan: Person = {
  name: "Alan",
  city: "Wilmslow",
  address: { city: "Manchester" },
  tags: ["crypto"],
  pets: [{ name: "Tib" }],
};

const toRows = (people: Person[]): TableRow<Person>[] =>
  people.map((data, index) => ({ index, data }));

const columns: TableColumn<Person>[] = [
  { title: "Name", dataKey: "name" },
  { title: "City", dataKey: "city" },
];

const selectColumn: TableLeadingColumn<Person> = {
  header: <input type="checkbox" aria-label="Select all rows" />,
  cell: (row) => (
    <input type="checkbox" aria-label={`Select row ${row.index + 1}`} />
  ),
};

const setup = (props: Partial<DataTableProps<Person>> = {}) =>
  render(
    <DataTable<Person>
      columns={columns}
      rows={toRows([ada, alan])}
      {...props}
    />
  );

const people = (count: number) =>
  toRows(
    Array.from({ length: count }, (_, i) => ({ ...ada, name: `Person ${i}` }))
  );

/** Plays an app that hands DataTable its scroll container. */
const Scrolling = ({ rows }: { rows: TableRow<Person>[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      <DataTable<Person> columns={columns} rows={rows} scrollParentRef={ref} />
    </div>
  );
};

const bodyRow = (name: RegExp) => screen.getByRole("row", { name });

describe("DataTable", () => {
  it("renders a header for each column, in order", () => {
    setup();

    expect(
      screen.getAllByRole("columnheader").map((h) => h.textContent)
    ).toEqual(["Name", "City"]);
  });

  it("leaves out a hidden column's header", () => {
    setup({
      columns: [...columns, { title: "Secret", dataKey: "name", hidden: true }],
    });

    expect(
      screen.queryByRole("columnheader", { name: "Secret" })
    ).not.toBeInTheDocument();
  });

  it("renders a custom header from headerElement, given the title", () => {
    setup({
      columns: [
        { title: "Name", dataKey: "name", headerElement: (t) => <em>{t}!</em> },
      ],
    });

    expect(screen.getByRole("columnheader", { name: "Name!" })).toBeVisible();
  });

  it("renders the leading column's header first", () => {
    setup({ leadingColumn: selectColumn });

    expect(screen.getAllByRole("columnheader")[0]).toContainElement(
      screen.getByRole("checkbox", { name: "Select all rows" })
    );
  });

  it("renders the leading column's cell for each row, given the row", () => {
    setup({ leadingColumn: selectColumn });

    expect(
      within(bodyRow(/Alan/)).getByRole("checkbox", { name: "Select row 2" })
    ).toBeVisible();
  });

  it.each([
    ["a top-level key", "name", "Ada"],
    ["a nested key", "address.city", "Paris"],
  ])("renders a cell from %s", (_, dataKey, expected) => {
    setup({ columns: [{ title: "Value", dataKey }], rows: toRows([ada]) });

    expect(screen.getByRole("cell", { name: expected })).toBeVisible();
  });

  it.each([
    ["an array index", "tags[1]", "code"],
    ["a key inside an array entry", "pets[0].name", "Rex"],
  ])("renders a cell from %s", (_, dataKey, expected) => {
    setup({ columns: [{ title: "Value", dataKey }], rows: toRows([ada]) });

    expect(screen.getByRole("cell", { name: expected })).toBeVisible();
  });

  it("renders a cell from cellElement, given the row data and its index", () => {
    setup({
      columns: [
        { title: "Who", cellElement: (data, i) => `${i + 1}. ${data.name}` },
      ],
    });

    expect(screen.getByRole("cell", { name: "2. Alan" })).toBeVisible();
  });

  it("prefers cellElement over dataKey", () => {
    setup({
      columns: [
        { title: "Name", dataKey: "name", cellElement: (d) => d.name.at(0) },
      ],
      rows: toRows([ada]),
    });

    expect(screen.getByRole("cell", { name: "A" })).toBeVisible();
  });

  it("renders an empty cell for a column with neither dataKey nor cellElement", () => {
    setup({ columns: [{ title: "Blank" }], rows: toRows([ada]) });

    expect(screen.getByRole("cell")).toBeEmptyDOMElement();
  });

  it("renders a single row", () => {
    setup({ rows: toRows([ada]) });

    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("renders only the header row for empty data", () => {
    setup({ rows: [] });

    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("calls onRowClick with the row's data", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    setup({ onRowClick });

    await user.click(screen.getByRole("cell", { name: "Wilmslow" }));

    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(alan);
  });

  it("does not call onRowClick from a disableRowClick column", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    setup({
      onRowClick,
      columns: [
        ...columns,
        {
          title: "Actions",
          disableRowClick: true,
          cellElement: (data) => <button>Delete {data.name}</button>,
        },
      ],
    });

    await user.click(screen.getByRole("button", { name: "Delete Ada" }));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("does not call onRowClick from the leading cell by default", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    setup({ onRowClick, leadingColumn: selectColumn });

    await user.click(screen.getByRole("checkbox", { name: "Select row 1" }));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("calls onRowClick from the leading cell when its disableRowClick is false", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    setup({
      onRowClick,
      leadingColumn: { ...selectColumn, disableRowClick: false },
    });

    await user.click(screen.getByRole("checkbox", { name: "Select row 1" }));

    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(ada);
  });

  it.each<[string, Partial<DataTableProps<Person>>, string]>([
    [
      "the defaults",
      {},
      "k-table k-table-striped k-table-hover k-table-bordered",
    ],
    [
      "plain styling",
      { striped: false, hover: false, bordered: false },
      "k-table",
    ],
  ])("maps %s to table classes", (_, props, classes) => {
    setup(props);

    expect(screen.getByRole("table")).toHaveClass(classes, { exact: true });
  });

  it("marks rows clickable when onRowClick is set", () => {
    setup({ onRowClick: () => {} });

    expect(bodyRow(/Ada/)).toHaveClass("k-data-table-row-clickable", {
      exact: true,
    });
  });

  it("does not mark rows clickable without onRowClick", () => {
    setup();

    expect(bodyRow(/Ada/)).not.toHaveClass("k-data-table-row-clickable");
  });

  it("maps align to the header cell's classes", () => {
    setup({ columns: [{ title: "City", dataKey: "city", align: "right" }] });

    expect(screen.getByRole("columnheader", { name: "City" })).toHaveClass(
      "k-data-table-header-cell k-data-table-align-right",
      { exact: true }
    );
  });

  it("maps align to the body cells' classes", () => {
    setup({
      columns: [{ title: "City", dataKey: "city", align: "center" }],
      rows: toRows([ada]),
    });

    expect(screen.getByRole("cell", { name: "London" })).toHaveClass(
      "k-data-table-align-center",
      { exact: true }
    );
  });

  it("sizes a header from the column's widths", () => {
    setup({
      columns: [
        {
          title: "Name",
          dataKey: "name",
          width: 120,
          minWidth: 80,
          maxWidth: 200,
        },
      ],
    });

    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveStyle({
      width: "120px",
      minWidth: "80px",
      maxWidth: "200px",
    });
  });

  it("renders every row without a scroll container, however many", () => {
    setup({ rows: people(101) });

    expect(screen.getAllByRole("row")).toHaveLength(102);
  });

  it("renders every row at the virtualization threshold", () => {
    render(<Scrolling rows={people(100)} />);

    expect(screen.getAllByRole("row")).toHaveLength(101);
  });

  it("renders only a window of rows past the virtualization threshold", () => {
    render(<Scrolling rows={people(101)} />);

    expect(
      screen.queryByRole("cell", { name: "Person 100" })
    ).not.toBeInTheDocument();
  });
});
