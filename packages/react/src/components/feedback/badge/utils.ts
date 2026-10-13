/**
 * Compute whether to use light or dark text on a given hex background.
 * Uses YIQ luminance formula.
 */
export const getContrastTextColor = (hex: string): "light" | "dark" => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return "dark";
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return "dark";
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "dark" : "light";
};
