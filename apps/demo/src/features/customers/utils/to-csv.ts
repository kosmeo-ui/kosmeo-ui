import type { Customer } from "@/types/api";

const COLUMNS = [
  "id",
  "name",
  "company",
  "email",
  "plan",
  "status",
  "mrr",
  "seats",
  "signedUp",
] as const satisfies (keyof Customer)[];

const cell = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;

export const toCsv = (rows: Customer[]) =>
  [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((key) => cell(row[key])).join(",")),
  ].join("\n");

export const downloadCsv = (rows: Customer[], fileName: string) => {
  const blob = new Blob([toCsv(rows)], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};
