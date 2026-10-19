const pad = (n: number) => n.toString().padStart(2, "0");

// `new Date("2024-01-05")` is UTC midnight, which is the previous day west of
// UTC; a date-only string means that calendar day locally.
const toDate = (value: string | Date): Date => {
  if (value instanceof Date) return value;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dateOnly) return new Date(value);
  const [, y, m, d] = dateOnly.map(Number);
  return new Date(y, m - 1, d);
};

export const toDateInputValue = (
  value: string | Date | null | undefined
): string => {
  if (value == null || value === "") return "";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toDateTimeLocalValue = (
  value: string | Date | null | undefined
): string => {
  if (value == null || value === "") return "";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export const dateTimeLocalToIso = (value: string): string | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
