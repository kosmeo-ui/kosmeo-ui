import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ImagePreview from "../index.js";

const one = ["/a.png"];
const two = ["/a.png", "/b.png"];

describe("ImagePreview", () => {
  it.each([
    ["Preview 1", "/a.png"],
    ["Preview 2", "/b.png"],
  ])("shows image %s", (name, src) => {
    render(
      <ImagePreview previewUrls={two} onClear={() => {}} onChange={() => {}} />
    );

    expect(screen.getByRole("img", { name })).toHaveAttribute("src", src);
  });

  it.each([
    ["one image", one, "Change Image", "Clear Image"],
    ["two images", two, "Change Images", "Clear All Images"],
  ])("labels the actions for %s", (_, previewUrls, change, clear) => {
    render(
      <ImagePreview
        previewUrls={previewUrls}
        onClear={() => {}}
        onChange={() => {}}
      />
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent)
    ).toEqual([change, clear]);
  });

  it("calls onChange when Change is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ImagePreview previewUrls={one} onClear={() => {}} onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: "Change Image" }));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("calls onClear when Clear is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <ImagePreview previewUrls={one} onClear={onClear} onChange={() => {}} />
    );

    await user.click(screen.getByRole("button", { name: "Clear Image" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it.each([
    [undefined, "k-image-preview-item k-image-preview-item-md"],
    ["sm" as const, "k-image-preview-item k-image-preview-item-sm"],
  ])("sizes the images for size %s", (size, classes) => {
    render(
      <ImagePreview
        previewUrls={one}
        size={size}
        onClear={() => {}}
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("img", { name: "Preview 1" })).toHaveClass(
      classes,
      {
        exact: true,
      }
    );
  });
});
