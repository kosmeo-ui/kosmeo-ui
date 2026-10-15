/**
 * Stable React keys for a list of items: an item's `value` field when it has
 * one, otherwise its label. Repeats get an occurrence suffix so keys stay
 * unique.
 */
export const itemKeys = <T>(items: T[], labelKey: keyof T): string[] => {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const id =
      typeof item === "object" && item !== null && "value" in item
        ? (item as { value: unknown }).value
        : item[labelKey];
    const base = String(id);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}#${count}`;
  });
};
