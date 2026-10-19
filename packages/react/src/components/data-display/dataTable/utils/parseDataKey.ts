import { ReactNode } from "react";

/**
 * Reads the value at `dataKey` ("name", "address.city", "tags[1]",
 * "pets[0].name"), or undefined when any part of the path is missing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseDataKey = (dataKey: string, data: any): unknown =>
  dataKey
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .reduce((value, key) => (value == null ? undefined : value[key]), data);

/** What a cell shows for a value: the value, or an em dash when there is none. */
export const cellText = (value: unknown): ReactNode =>
  value === undefined || value === null || value === ""
    ? "—"
    : (value as ReactNode);

export default parseDataKey;
