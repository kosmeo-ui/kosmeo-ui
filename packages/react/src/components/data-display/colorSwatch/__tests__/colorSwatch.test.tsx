import ColorSwatch, { ColorSwatchProps } from "../index.js";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("ColorSwatch", () => {
  it("is an image named by its title", () => {
    render(<ColorSwatch color="#ff0000" title="Red" />);

    expect(screen.getByRole("img", { name: "Red" })).toHaveAttribute(
      "title",
      "Red"
    );
  });

  it("fills with the colour", () => {
    render(<ColorSwatch color="#ff0000" title="Red" />);

    expect(screen.getByRole("img", { name: "Red" })).toHaveStyle({
      backgroundColor: "#ff0000",
    });
  });

  it.each<[string, Partial<ColorSwatchProps>, string]>([
    [
      "the defaults",
      {},
      "k-color-swatch k-color-swatch-md k-color-swatch-bordered",
    ],
    [
      "size lg",
      { size: "lg" },
      "k-color-swatch k-color-swatch-lg k-color-swatch-bordered",
    ],
    ["no border", { bordered: false }, "k-color-swatch k-color-swatch-md"],
  ])("maps %s to classes", (_, props, classes) => {
    render(<ColorSwatch color="#ff0000" title="Red" {...props} />);

    expect(screen.getByRole("img", { name: "Red" })).toHaveClass(classes, {
      exact: true,
    });
  });

  it("is named by its colour without a title", () => {
    render(<ColorSwatch color="#ff0000" />);

    expect(screen.getByRole("img", { name: "#ff0000" })).toBeVisible();
  });

  it("shows its colour as a tooltip without a title", () => {
    render(<ColorSwatch color="#ff0000" />);

    expect(screen.getByRole("img")).toHaveAttribute("title", "#ff0000");
  });
});
