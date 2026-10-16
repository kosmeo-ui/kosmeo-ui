import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FileDropZone from "../index.js";

const file = (name: string, type = "text/plain") =>
  new File(["x"], name, { type });

/** Matches a file list by name: equality alone cannot tell two Files apart. */
const named = (...names: string[]) =>
  names.map((name) => expect.objectContaining({ name }));

const files = (count: number) =>
  Array.from({ length: count }, (_, i) => file(`f${i}.txt`));

// user-event has no drag and drop, and jsdom has no DataTransfer, so a drag is
// a synthetic event carrying only the `dataTransfer.files` the handlers read.
const dragEvent = (type: string, dropped: File[] = []) =>
  Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
    dataTransfer: { files: dropped },
  });

/** Dispatches a drag event onto the zone's text, where a user drops. */
const dispatch = (event: Event, label = "Drag and drop files here") => {
  act(() => {
    screen.getByText(label).dispatchEvent(event);
  });
  return event;
};

const drop = (dropped: File[]) => dispatch(dragEvent("drop", dropped));

// The zone has no role; its class is the drag highlight.
const zone = () => screen.getByText("Drag and drop files here").parentElement;

const setup = (props: { maxFiles?: number; accept?: string } = {}) => {
  const onFilesSelected = vi.fn();
  const onError = vi.fn();
  render(
    <FileDropZone
      onFilesSelected={onFilesSelected}
      onError={onError}
      {...props}
    />
  );
  return { onFilesSelected, onError };
};

describe("FileDropZone", () => {
  it("shows the default prompt", () => {
    setup();

    expect(screen.getByText("Drag and drop files here")).toBeVisible();
  });

  it("shows a custom prompt", () => {
    render(<FileDropZone onFilesSelected={() => {}} label="Drop photos" />);

    expect(screen.getByText("Drop photos")).toBeVisible();
  });

  it("passes the accepted types to the file picker", () => {
    setup({ accept: "image/*" });

    expect(screen.getByLabelText("Browse Files")).toHaveAttribute(
      "accept",
      "image/*"
    );
  });

  it("selects browsed files", async () => {
    const user = userEvent.setup();
    const { onFilesSelected } = setup();

    await user.upload(screen.getByLabelText("Browse Files"), [
      file("a.txt"),
      file("b.txt"),
    ]);

    expect(onFilesSelected).toHaveBeenCalledWith(named("a.txt", "b.txt"));
  });

  it("rejects a browsed file of the wrong type", async () => {
    // The picker's "All files" option lets a user pick past `accept`.
    const user = userEvent.setup({ applyAccept: false });
    const { onError } = setup({ accept: ".pdf" });

    await user.upload(screen.getByLabelText("Browse Files"), file("a.txt"));

    expect(onError).toHaveBeenCalledWith("Please upload valid file types only");
  });

  it("selects dropped files", () => {
    const { onFilesSelected } = setup();

    drop([file("a.txt"), file("b.txt")]);

    expect(onFilesSelected).toHaveBeenCalledWith(named("a.txt", "b.txt"));
  });

  it.each([
    ["image/*", "photo.png", "image/png"],
    [".pdf", "REPORT.PDF", "application/pdf"],
    ["image/png", "photo.png", "image/png"],
    ["image/png, .pdf", "report.pdf", "application/pdf"],
  ])("accepts %s: %s", (accept, name, type) => {
    const { onFilesSelected } = setup({ accept });

    drop([file(name, type)]);

    expect(onFilesSelected).toHaveBeenCalledWith(named(name));
  });

  it.each([
    ["image/*", "report.pdf", "application/pdf"],
    ["image/*", "unknown", ""],
    [".pdf", "notes.txt", "text/plain"],
    [".pdf", "report.pdf.txt", "text/plain"],
    ["image/png", "photo.jpg", "image/jpeg"],
  ])("rejects %s: %s", (accept, name, type) => {
    const { onError } = setup({ accept });

    drop([file(name, type)]);

    expect(onError).toHaveBeenCalledWith("Please upload valid file types only");
  });

  it("does not select files when every type is rejected", () => {
    const { onFilesSelected } = setup({ accept: ".pdf" });

    drop([file("notes.txt")]);

    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it("selects only the accepted files from a mixed drop", () => {
    const { onFilesSelected } = setup({ accept: ".pdf" });

    drop([file("notes.txt"), file("report.pdf", "application/pdf")]);

    expect(onFilesSelected).toHaveBeenCalledWith(named("report.pdf"));
  });

  it.each([
    [2, 2],
    [undefined, 15],
  ])("selects up to the limit: max %s, %i files", (maxFiles, count) => {
    const { onFilesSelected } = setup({ maxFiles });

    drop(files(count));

    expect(onFilesSelected).toHaveBeenCalledTimes(1);
  });

  it.each([
    [2, 3, "Too many files selected. Select no more than 2"],
    [undefined, 16, "Too many files selected. Select no more than 15"],
  ])(
    "rejects one past the limit: max %s, %i files",
    (maxFiles, count, error) => {
      const { onError } = setup({ maxFiles });

      drop(files(count));

      expect(onError).toHaveBeenCalledWith(error);
    }
  );

  it("does not select files past the limit", () => {
    const { onFilesSelected } = setup({ maxFiles: 2 });

    drop(files(3));

    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it("counts only accepted files against the limit", () => {
    const { onFilesSelected } = setup({ maxFiles: 2, accept: ".txt" });

    drop([file("photo.png", "image/png"), ...files(2)]);

    expect(onFilesSelected).toHaveBeenCalledWith(named("f0.txt", "f1.txt"));
  });

  it("ignores a rejected drop when there is no onError", () => {
    const onFilesSelected = vi.fn();
    render(<FileDropZone onFilesSelected={onFilesSelected} accept=".pdf" />);

    drop([file("notes.txt")]);

    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it("ignores a drop with no files, such as dragged text", () => {
    const { onFilesSelected } = setup();

    drop([]);

    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it("is not highlighted at rest", () => {
    setup();

    expect(zone()).toHaveClass("k-file-drop-zone", { exact: true });
  });

  it("is highlighted while files are dragged over it", () => {
    setup();

    dispatch(dragEvent("dragover"));

    expect(zone()).toHaveClass("k-file-drop-zone k-file-drop-zone-dragging", {
      exact: true,
    });
  });

  it.each(["dragleave", "drop"])("stops highlighting on %s", (type) => {
    setup();
    dispatch(dragEvent("dragover"));

    dispatch(dragEvent(type));

    expect(zone()).toHaveClass("k-file-drop-zone", { exact: true });
  });

  // A dragover that is not cancelled tells the browser the zone refuses drops;
  // a drop that is not cancelled makes the browser open the file.
  it.each(["dragover", "drop"])("cancels %s", (type) => {
    setup();

    const event = dispatch(dragEvent(type, [file("a.txt")]));

    expect(event.defaultPrevented).toBe(true);
  });

  // Bug: the input's id is hardcoded, so every zone's "Browse Files" label
  // opens the first zone's picker.
  it.fails("browses into its own zone when there are two", async () => {
    const user = userEvent.setup();
    const onSecond = vi.fn();
    render(
      <>
        <FileDropZone onFilesSelected={() => {}} label="Photos" />
        <FileDropZone onFilesSelected={onSecond} label="Documents" />
      </>
    );

    await user.upload(screen.getAllByText("Browse Files")[1], file("a.txt"));

    expect(onSecond).toHaveBeenCalledWith(named("a.txt"));
  });
});
