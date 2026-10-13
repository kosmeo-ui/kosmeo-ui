import { ReactNode } from "react";

/**
 * DataKey is the key used to access the data in the data object.
 *
 * To access nested data, use dot notation.
 *
 * For example, if the data object is { foo: { bar: "baz" } }, then the dataKey would be "foo.bar"
 *
 * To access an array, use bracket notation.
 *
 * For example, if the data object is { foo: ["bar", "baz"] }, then the dataKey would be "foo[0]"
 *
 * To access an array of objects, use dot notation and bracket notation.
 *
 * For example, if the data object is { foo: [{ bar: "baz" }] }, then the dataKey would be "foo[0].bar"
 */
export type DataKey = string;

export interface TableColumn<TData> {
  /**
   * The title to render inside the <th> tags
   *
   * NOTE: This is also the value that will be passed to the headerElement function.
   */
  title: string;
  /**
   * Required if there is no cellElement function.
   *
   * DataKey is the key used to access the data in the data object.
   *
   * This data is what will be displayed in the <td> tags.
   */
  dataKey?: DataKey;
  /** When true, the column is omitted from the rendered table. */
  hidden?: boolean;
  /** The desired fixed width of the column */
  width?: React.CSSProperties["width"];
  /** The desired minimum width of the column */
  minWidth?: React.CSSProperties["minWidth"];
  /** The desired maximum width of the column */
  maxWidth?: React.CSSProperties["maxWidth"];
  /** Text alignment for the column content. Defaults to 'left' */
  align?: "left" | "center" | "right";
  /**
   * When true, clicking on cells in this column will not trigger the row click handler
   */
  disableRowClick?: boolean;
  /**
   * React Element to render inside the <th> tags.
   */
  headerElement?: (title: string) => ReactNode | string;
  /**
   * React Element to render inside the <td> tags. Receives the row data and
   * the zero-based row index — index is needed by inline-editable tables that
   * dispatch updates targeting a specific row.
   */
  cellElement?: (rowData: TData, index: number) => ReactNode | string;
}

export interface TableRow<TData> {
  index: number;
  data: TData;
}

export interface TableLeadingColumn<TData> {
  header: ReactNode;
  cell: (row: TableRow<TData>) => ReactNode;
  /** When true, clicks on the leading cell don't trigger the row click. Defaults to true. */
  disableRowClick?: boolean;
}
