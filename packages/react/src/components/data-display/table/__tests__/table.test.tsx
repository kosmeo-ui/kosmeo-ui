import { Link, MemoryRouter, Route, Routes } from "react-router";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReactNode } from "react";
import Table, {
  TableCellButton,
  TableCellLink,
  TableColumn,
  TableProps,
} from "../index.js";

interface Person {
  name: string;
  city: string;
  address: { city: string };
  tags: string[];
  pets: { name: string }[];
  age: number | null;
}

const ada: Person = {
  name: "Ada",
  city: "London",
  address: { city: "Paris" },
  tags: ["math", "code"],
  pets: [{ name: "Rex" }],
  age: 36,
};
const alan: Person = {
  name: "Alan",
  city: "Wilmslow",
  address: { city: "Manchester" },
  tags: ["crypto"],
  pets: [{ name: "Tib" }],
  age: 41,
};

const columns: TableColumn<Person>[] = [
  { title: "Name", dataKey: "name" },
  { title: "City", dataKey: "city" },
];

const setup = (props: Partial<TableProps<Person>> = {}) =>
  render(<Table<Person> columns={columns} rows={[ada, alan]} {...props} />);

const bodyRow = (name: RegExp) => screen.getByRole("row", { name });

/** A Name column whose cells are `cell(row)`, beside the City column. */
const withNameCell = (
  cell: (row: Person) => ReactNode
): TableColumn<Person>[] => [
  { title: "Name", cellElement: cell },
  { title: "City", dataKey: "city" },
];

const routerLinkColumns = withNameCell((row) => (
  <TableCellLink as={Link} to={`/people/${row.name}`}>
    {row.name}
  </TableCellLink>
));

/** Plays an app with a route for each person, the table on "/". */
const renderRouted = (table: ReactNode) =>
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={table} />
        <Route path="/people/:name" element={<h1>Person page</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe("Table", () => {
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

  it("leaves out a hidden column's cells", () => {
    setup({
      columns: [{ title: "Name", dataKey: "name", hidden: true }, columns[1]],
    });

    expect(within(bodyRow(/London/)).getAllByRole("cell")).toHaveLength(1);
  });

  it("renders a custom header from headerElement, given the title", () => {
    setup({
      columns: [
        { title: "Name", dataKey: "name", headerElement: (t) => <em>{t}!</em> },
      ],
    });

    expect(screen.getByRole("columnheader", { name: "Name!" })).toBeVisible();
  });

  it.each([
    ["a top-level key", "name", "Ada"],
    ["a nested key", "address.city", "Paris"],
  ])("renders a cell from %s", (_, dataKey, expected) => {
    setup({ columns: [{ title: "Value", dataKey }], rows: [ada] });

    expect(screen.getByRole("cell", { name: expected })).toBeVisible();
  });

  it.each([
    ["an array index", "tags[1]", "code"],
    ["a key inside an array entry", "pets[0].name", "Rex"],
  ])("renders a cell from %s", (_, dataKey, expected) => {
    setup({ columns: [{ title: "Value", dataKey }], rows: [ada] });

    expect(screen.getByRole("cell", { name: expected })).toBeVisible();
  });

  it("renders a zero value rather than an empty cell", () => {
    setup({
      columns: [{ title: "Age", dataKey: "age" }],
      rows: [{ ...ada, age: 0 }],
    });

    expect(screen.getByRole("cell", { name: "0" })).toBeVisible();
  });

  it("renders a cell from consecutive array indexes", () => {
    const row = { ...ada, grid: [["a", "b"]] };

    setup({
      columns: [{ title: "Value", dataKey: "grid[0][1]" }],
      rows: [row],
    });

    expect(screen.getByRole("cell", { name: "b" })).toBeVisible();
  });

  it.each([
    ["a null value", "age", { ...ada, age: null }],
    ["an empty string", "city", { ...ada, city: "" }],
    ["a missing field", "nickname", ada],
    ["a missing nested field", "address.zip", ada],
    ["a missing parent object", "owner.name", ada],
    ["an index past the end", "pets[3].name", ada],
  ])("renders an em dash for %s", (_, dataKey, row) => {
    setup({ columns: [{ title: "Value", dataKey }], rows: [row as Person] });

    expect(screen.getByRole("cell", { name: "—" })).toBeVisible();
  });

  it("renders a cell from cellElement, given the row and its index", () => {
    setup({
      columns: [
        { title: "Who", cellElement: (row, i) => `${i + 1}. ${row.name}` },
      ],
    });

    expect(screen.getByRole("cell", { name: "2. Alan" })).toBeVisible();
  });

  it("prefers cellElement over dataKey", () => {
    setup({
      columns: [
        { title: "Name", dataKey: "name", cellElement: (r) => r.name.at(0) },
      ],
      rows: [ada],
    });

    expect(screen.getByRole("cell", { name: "A" })).toBeVisible();
  });

  it("renders an empty cell for a column with neither dataKey nor cellElement", () => {
    setup({ columns: [{ title: "Blank" }], rows: [ada] });

    expect(screen.getByRole("cell")).toBeEmptyDOMElement();
  });

  it("renders a single row", () => {
    setup({ rows: [ada] });

    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("shows the empty message in one cell spanning the visible columns", () => {
    setup({
      columns: [...columns, { title: "Secret", dataKey: "name", hidden: true }],
      rows: [],
      emptyMessage: "Nobody here",
    });

    expect(screen.getByRole("cell", { name: "Nobody here" })).toHaveAttribute(
      "colspan",
      "2"
    );
  });

  it("renders no body rows for empty data without an empty message", () => {
    setup({ rows: [] });

    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("does not show the empty message when there are rows", () => {
    setup({ rows: [ada], emptyMessage: "Nobody here" });

    expect(screen.queryByText("Nobody here")).not.toBeInTheDocument();
  });

  it("calls onRowClick with the row and its index", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    setup({ onRowClick });

    await user.click(screen.getByRole("cell", { name: "Wilmslow" }));

    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(alan, 1);
  });

  it("does not call onRowClick from a disableRowClick column", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onDelete = vi.fn();
    setup({
      onRowClick,
      columns: [
        ...columns,
        {
          title: "Actions",
          disableRowClick: true,
          cellElement: (row) => (
            <button onClick={() => onDelete(row)}>Delete {row.name}</button>
          ),
        },
      ],
    });

    await user.click(screen.getByRole("button", { name: "Delete Ada" }));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("calls a disableRowClick column's own action", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    setup({
      onRowClick: () => {},
      columns: [
        {
          title: "Actions",
          disableRowClick: true,
          cellElement: (row) => (
            <button onClick={() => onDelete(row)}>Delete {row.name}</button>
          ),
        },
      ],
    });

    await user.click(screen.getByRole("button", { name: "Delete Ada" }));

    expect(onDelete).toHaveBeenCalledExactlyOnceWith(ada);
  });

  it("reaches a TableCellLink with Tab", async () => {
    const user = userEvent.setup();
    renderRouted(
      <Table<Person>
        columns={routerLinkColumns}
        rows={[ada, alan]}
        onRowClick={() => {}}
      />
    );

    await user.tab();

    expect(screen.getByRole("link", { name: "Ada" })).toHaveFocus();
  });

  it("follows a TableCellLink on Enter", async () => {
    const user = userEvent.setup();
    renderRouted(
      <Table<Person>
        columns={routerLinkColumns}
        rows={[ada, alan]}
        onRowClick={() => {}}
      />
    );
    await user.tab();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("heading", { name: "Person page" })).toBeVisible();
  });

  it("does not call onRowClick when Enter follows a TableCellLink", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderRouted(
      <Table<Person>
        columns={routerLinkColumns}
        rows={[ada, alan]}
        onRowClick={onRowClick}
      />
    );
    await user.tab();

    await user.keyboard("{Enter}");

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it.each<[string, TableColumn<Person>[], { name: string; role: string }]>([
    [
      "a TableCellLink",
      withNameCell((row) => (
        <TableCellLink href={`#${row.name}`}>{row.name}</TableCellLink>
      )),
      { role: "link", name: "Ada" },
    ],
    [
      "a TableCellButton",
      withNameCell((row) => (
        <TableCellButton onClick={() => {}}>{row.name}</TableCellButton>
      )),
      { role: "button", name: "Ada" },
    ],
    [
      "a plain button",
      withNameCell((row) => <button>Open {row.name}</button>),
      { role: "button", name: "Open Ada" },
    ],
  ])(
    "does not call onRowClick on a click on %s in a cell",
    async (_, cellColumns, target) => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      setup({ onRowClick, columns: cellColumns });

      await user.click(screen.getByRole(target.role, { name: target.name }));

      expect(onRowClick).not.toHaveBeenCalled();
    }
  );

  it.each(["Meta", "Control"])(
    "does not call onRowClick on a %s-click on a link in a cell",
    async (modifier) => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      setup({
        onRowClick,
        columns: withNameCell((row) => (
          <TableCellLink href={`#${row.name}`}>{row.name}</TableCellLink>
        )),
      });

      await user.keyboard(`{${modifier}>}`);
      await user.click(screen.getByRole("link", { name: "Ada" }));

      expect(onRowClick).not.toHaveBeenCalled();
    }
  );

  it("calls onRowClick once on a click on plain text in a row with a link", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    setup({
      onRowClick,
      columns: withNameCell((row) => (
        <TableCellLink href={`#${row.name}`}>{row.name}</TableCellLink>
      )),
    });

    await user.click(screen.getByRole("cell", { name: "Wilmslow" }));

    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(alan, 1);
  });

  it("marks the rows isRowSelected picks", () => {
    setup({ isRowSelected: (row) => row.name === "Alan" });

    expect(bodyRow(/Alan/)).toHaveAttribute("data-selected", "true");
  });

  it("leaves rows isRowSelected rejects unmarked", () => {
    setup({ isRowSelected: (row) => row.name === "Alan" });

    expect(bodyRow(/Ada/)).not.toHaveAttribute("data-selected");
  });

  it("keeps each row's state with its row when rowKey is set and rows reorder", async () => {
    const user = userEvent.setup();
    const noteColumn: TableColumn<Person>[] = [
      {
        title: "Note",
        cellElement: (row) => <input aria-label={`Note for ${row.name}`} />,
      },
    ];
    const { rerender } = render(
      <Table<Person>
        columns={noteColumn}
        rows={[ada, alan]}
        rowKey={(row) => row.name}
      />
    );
    await user.type(
      screen.getByRole("textbox", { name: "Note for Alan" }),
      "x"
    );

    rerender(
      <Table<Person>
        columns={noteColumn}
        rows={[alan, ada]}
        rowKey={(row) => row.name}
      />
    );

    expect(screen.getByRole("textbox", { name: "Note for Alan" })).toHaveValue(
      "x"
    );
  });

  it.each<[string, Partial<TableProps<Person>>, string]>([
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
    [
      "a row click handler",
      { striped: false, hover: false, bordered: false, onRowClick: () => {} },
      "k-table k-table-clickable",
    ],
  ])("maps %s to table classes", (_, props, classes) => {
    setup(props);

    expect(screen.getByRole("table")).toHaveClass(classes, { exact: true });
  });

  it("maps align to the header cell's classes", () => {
    setup({ columns: [{ title: "Age", dataKey: "age", align: "right" }] });

    expect(screen.getByRole("columnheader", { name: "Age" })).toHaveClass(
      "k-data-table-header-cell k-data-table-align-right",
      { exact: true }
    );
  });

  it("maps align to the body cells' classes", () => {
    setup({
      columns: [{ title: "Age", dataKey: "age", align: "right" }],
      rows: [ada],
    });

    expect(screen.getByRole("cell", { name: "36" })).toHaveClass(
      "k-data-table-align-right",
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

  it("puts style on the table without maxHeight", () => {
    setup({ style: { marginTop: "4px" } });

    expect(screen.getByRole("table")).toHaveStyle({ marginTop: "4px" });
  });

  // The scroll container is a role-less div whose inline style is the contract.
  it.each([
    [300, "300px"],
    ["75%", "75%"],
  ])(
    "wraps the table in a scroll container of maxHeight %s",
    (maxHeight, css) => {
      setup({ maxHeight, style: { marginTop: "4px" } });

      expect(screen.getByRole("table").parentElement).toHaveStyle({
        maxHeight: css,
        marginTop: "4px",
      });
    }
  );

  it("moves style off the table onto the scroll container", () => {
    setup({ maxHeight: 300, style: { marginTop: "4px" } });

    expect(screen.getByRole("table")).not.toHaveAttribute("style");
  });
});

describe("TableCellLink", () => {
  it("renders the href of a react-router Link's to", () => {
    render(
      <MemoryRouter>
        <TableCellLink as={Link} to="/users/1">
          Ada
        </TableCellLink>
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Ada" })).toHaveAttribute(
      "href",
      "/users/1"
    );
  });

  it("renders a plain anchor with its href by default", () => {
    render(<TableCellLink href="/users/1">Ada</TableCellLink>);

    expect(screen.getByRole("link", { name: "Ada" })).toHaveAttribute(
      "href",
      "/users/1"
    );
  });
});

describe("TableCellButton", () => {
  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("calls onClick on %s", async (_, key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TableCellButton onClick={onClick}>Ada</TableCellButton>);
    await user.tab();

    await user.keyboard(key);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not submit a surrounding form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <TableCellButton>Ada</TableCellButton>
      </form>
    );

    await user.click(screen.getByRole("button", { name: "Ada" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
