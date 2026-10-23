"use client";

import { themeTokenNames, ThemeToken } from "./tokens.js";
import { PropsWithChildren } from "react";

export type { ThemeToken } from "./tokens.js";

export type ThemeTokens = Partial<Record<ThemeToken, string>>;

export interface Theme {
  light?: ThemeTokens;
  dark?: ThemeTokens;
}

export interface ThemeProviderProps extends PropsWithChildren {
  /**
   * Token values for each theme. A token left out keeps the library default;
   * a `<family>Color` without its `Hover`/`Active` shades gets them mixed from it.
   */
  theme: Theme;
}

const propertyByToken = new Map<string, string>(
  themeTokenNames.map((name) => [
    name.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase()),
    `--k-${name}`,
  ])
);

const shadedFamilies = ["primary", "secondary", "warning", "danger", "success"];

// `:root` alone would tie with styles.css and lose whenever that loads later.
const selectors = {
  light: ':root:not([data-theme="dark"])',
  dark: ':root[data-theme="dark"]',
};

const declarations = (tokens: ThemeTokens = {}) => {
  const values: Record<string, string | undefined> = { ...tokens };
  for (const family of shadedFamilies) {
    if (!values[`${family}Color`]) continue;
    values[`${family}ColorHover`] ??=
      `color-mix(in oklab, var(--k-${family}-color), white 12%)`;
    values[`${family}ColorActive`] ??=
      `color-mix(in oklab, var(--k-${family}-color), black 12%)`;
  }
  return (
    Object.entries(values)
      // A value with `;`, `{` or `}` could end the declaration and inject rules.
      .filter(
        ([token, value]) =>
          propertyByToken.has(token) && value && !/[;{}]/.test(value)
      )
      .map(([token, value]) => `${propertyByToken.get(token)}:${value};`)
      .join("")
  );
};

/** Overrides the library's theme tokens with the app's own, for light and dark. */
const ThemeProvider = ({ theme, children }: ThemeProviderProps) => {
  const css = (["light", "dark"] as const)
    .map((mode) => {
      const body = declarations(theme[mode]);
      return body && `${selectors[mode]}{${body}}`;
    })
    .join("");

  return (
    <>
      {css && <style>{css}</style>}
      {children}
    </>
  );
};

export default ThemeProvider;
