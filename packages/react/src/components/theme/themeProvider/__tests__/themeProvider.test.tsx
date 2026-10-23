import { afterEach, describe, expect, it } from "vitest";
import ThemeProvider, { ThemeTokens } from "../index.js";
import { render, screen } from "@testing-library/react";
import { themeTokenNames } from "../tokens.js";
import { readFileSync } from "fs";
import { resolve } from "path";

const rootValue = (property: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(property);

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

it("renders its children", () => {
  render(
    <ThemeProvider theme={{}}>
      <p>Content</p>
    </ThemeProvider>
  );

  expect(screen.getByText("Content")).toBeVisible();
});

it("renders nothing of its own for an empty theme", () => {
  const { container } = render(
    <ThemeProvider theme={{ light: {}, dark: {} }} />
  );

  expect(container).toBeEmptyDOMElement();
});

it.each([
  ["light", undefined, "#fff"],
  ["dark", "dark", "#000"],
])("applies the %s theme's tokens", (_, dataTheme, expected) => {
  if (dataTheme) document.documentElement.dataset.theme = dataTheme;

  render(
    <ThemeProvider
      theme={{
        light: { backgroundColor: "#fff" },
        dark: { backgroundColor: "#000" },
      }}
    />
  );

  expect(rootValue("--k-background-color")).toBe(expected);
});

it("keeps the light theme's tokens out of dark mode", () => {
  document.documentElement.dataset.theme = "dark";

  render(<ThemeProvider theme={{ light: { backgroundColor: "#fff" } }} />);

  expect(rootValue("--k-background-color")).toBe("");
});

describe("hover and active shades", () => {
  it.each([
    ["keeps a hover shade the theme sets", "--k-primary-color-hover", "#222"],
    [
      "mixes an active shade the theme leaves out",
      "--k-primary-color-active",
      "color-mix(in oklab,var(--k-primary-color),black 12%)",
    ],
    [
      "mixes nothing for a family without a color",
      "--k-danger-color-hover",
      "",
    ],
  ])("%s", (_, property, expected) => {
    render(
      <ThemeProvider
        theme={{ light: { primaryColor: "#111", primaryColorHover: "#222" } }}
      />
    );

    expect(rootValue(property)).toBe(expected);
  });
});

it.each([
  ["an unknown token", { notAToken: "blue" } as ThemeTokens],
  ["an empty value", { textColor: "" }],
  [
    "a value that could end the declaration",
    { textColor: "red; } body { display: none" },
  ],
])("drops %s", (_, tokens) => {
  const { container } = render(<ThemeProvider theme={{ light: tokens }} />);

  expect(container).toBeEmptyDOMElement();
});

it("knows every token styles.css defines", () => {
  const styles = readFileSync(
    resolve(import.meta.dirname, "../../../../styles.css"),
    "utf8"
  );

  const defined = [...styles.matchAll(/^\s*--k-([a-z0-9-]+):/gm)].map(
    (match) => match[1]
  );

  expect(new Set(themeTokenNames)).toEqual(new Set(defined));
});
