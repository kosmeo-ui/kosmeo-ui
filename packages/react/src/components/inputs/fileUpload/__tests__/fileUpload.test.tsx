import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FileUpload from "../index.js";

const file = (name: string, size = 1, type = "text/plain") =>
  new File(["x".repeat(size)], name, { type });

/** Matches a file list by name: equality alone cannot tell two Files apart. */
const named = (...names: string[]) =>
  names.map((name) => expect.objectContaining({ name }));

/** A file reporting `size` bytes without allocating them. */
const bigFile = (name: string, size: number) =>
  Object.defineProperty(file(name), "size", { value: size });

describe("FileUpload", () => {
  it("shows its label", () => {
    render(<FileUpload onFileSelect={() => {}} label="Attachments" />);

    expect(screen.getByText("Attachments")).toBeVisible();
  });

  it("is named by its label", () => {
    render(<FileUpload onFileSelect={() => {}} label="Attachments" />);

    expect(screen.getByLabelText("Attachments")).toBeVisible();
  });

  it.each([
    [false, "Upload File"],
    [true, "Upload Files"],
  ])("names the upload button when multiple is %s", (multiple, name) => {
    render(<FileUpload onFileSelect={() => {}} multiple={multiple} />);

    expect(screen.getByText(name)).toBeVisible();
  });

  it("takes one file by default", () => {
    render(<FileUpload onFileSelect={() => {}} />);

    expect(screen.getByLabelText("Upload File")).not.toHaveAttribute(
      "multiple"
    );
  });

  it("takes several files when multiple", () => {
    render(<FileUpload onFileSelect={() => {}} multiple />);

    expect(screen.getByLabelText("Upload Files")).toHaveAttribute("multiple");
  });

  it("styles the upload button from variant and size", () => {
    render(<FileUpload onFileSelect={() => {}} variant="danger" size="sm" />);

    expect(screen.getByText("Upload File")).toHaveClass(
      "k-button k-button-danger k-button-sm k-button-center k-file-upload-button",
      { exact: true }
    );
  });

  it("passes the accepted types to the input", () => {
    render(<FileUpload onFileSelect={() => {}} accept=".pdf" />);

    expect(screen.getByLabelText("Upload File")).toHaveAttribute(
      "accept",
      ".pdf"
    );
  });

  it("marks required fields", () => {
    render(<FileUpload onFileSelect={() => {}} label="Attachments" required />);

    // Label text includes the aria-hidden asterisk.
    expect(screen.getByLabelText(/^Attachments/)).toBeRequired();
  });

  it("is not required by default", () => {
    render(<FileUpload onFileSelect={() => {}} label="Attachments" />);

    expect(screen.getByLabelText("Attachments")).not.toBeRequired();
  });

  it("uses the id it is given", () => {
    render(<FileUpload onFileSelect={() => {}} id="docs" />);

    expect(screen.getByLabelText("Upload File")).toHaveAttribute("id", "docs");
  });

  it("selects an uploaded file", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    await user.upload(screen.getByLabelText("Upload File"), file("a.txt"));

    expect(onFileSelect).toHaveBeenCalledWith(named("a.txt"));
  });

  it("lists the uploaded files", async () => {
    const user = userEvent.setup();
    render(<FileUpload onFileSelect={() => {}} multiple />);

    await user.upload(screen.getByLabelText("Upload Files"), [
      file("a.txt"),
      file("b.txt"),
    ]);

    expect(screen.getByText("Selected Files (2)")).toBeVisible();
  });

  it("hides the upload button once files are selected", async () => {
    const user = userEvent.setup();
    render(<FileUpload onFileSelect={() => {}} />);

    await user.upload(screen.getByLabelText("Upload File"), file("a.txt"));

    expect(screen.queryByText("Upload File")).not.toBeInTheDocument();
  });

  it("replaces the selection on a new upload", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(
      <FileUpload
        onFileSelect={onFileSelect}
        label="Attachments"
        initialFiles={[file("old.txt")]}
      />
    );

    await user.upload(screen.getByLabelText("Attachments"), file("new.txt"));

    expect(onFileSelect).toHaveBeenLastCalledWith(named("new.txt"));
  });

  it("clears the selection when the picker returns no files", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} label="Attachments" />);
    const input = screen.getByLabelText("Attachments");
    await user.upload(input, file("old.txt"));

    await user.upload(input, []);

    expect(onFileSelect).toHaveBeenLastCalledWith(null);
  });

  it.each([
    [0, "0 Bytes"],
    [1023, "1023 Bytes"],
    [1024, "1 KB"],
    [1536, "1.5 KB"],
    [1024 ** 2, "1 MB"],
    [1024 ** 3, "1 GB"],
  ])("shows a %i-byte file as %s", (size, shown) => {
    render(
      <FileUpload
        onFileSelect={() => {}}
        initialFiles={[bigFile("a.txt", size)]}
      />
    );

    expect(screen.getByText(`(${shown})`)).toBeVisible();
  });

  it.todo(
    "decide how to show a file of 1 TB or more — currently its size reads as (1 undefined)"
  );

  describe("initial files", () => {
    it("lists the initial files", () => {
      render(
        <FileUpload onFileSelect={() => {}} initialFiles={[file("a.txt")]} />
      );

      expect(screen.getByText("a.txt")).toBeVisible();
    });

    it("tells the parent about the initial files once", () => {
      const onFileSelect = vi.fn();

      render(
        <FileUpload
          onFileSelect={onFileSelect}
          initialFiles={[file("a.txt")]}
        />
      );

      expect(onFileSelect.mock.calls).toEqual([[named("a.txt")]]);
    });

    it("does not call onFileSelect for an empty seed", () => {
      const onFileSelect = vi.fn();

      render(<FileUpload onFileSelect={onFileSelect} initialFiles={[]} />);

      expect(onFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("file list", () => {
    it.each([
      [1, "Change File"],
      [2, "Change Files"],
    ])("names the change button for %i file(s)", (count, name) => {
      const seed = Array.from({ length: count }, (_, i) => file(`${i}.txt`));
      render(<FileUpload onFileSelect={() => {}} initialFiles={seed} />);

      expect(screen.getByRole("button", { name })).toBeVisible();
    });

    it("opens the picker from the change button", async () => {
      const user = userEvent.setup();
      const onPick = vi.fn();
      render(
        <FileUpload
          onFileSelect={() => {}}
          label="Attachments"
          initialFiles={[file("a.txt")]}
        />
      );
      screen.getByLabelText("Attachments").addEventListener("click", onPick);

      await user.click(screen.getByRole("button", { name: "Change File" }));

      expect(onPick).toHaveBeenCalledTimes(1);
    });

    it("removes a file", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(
        <FileUpload
          onFileSelect={onFileSelect}
          initialFiles={[file("a.txt"), file("b.txt")]}
        />
      );

      await user.click(screen.getByRole("button", { name: "Remove b.txt" }));

      expect(onFileSelect).toHaveBeenLastCalledWith(named("a.txt"));
    });

    it("stops listing a removed file", async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileSelect={() => {}}
          initialFiles={[file("a.txt"), file("b.txt")]}
        />
      );

      await user.click(screen.getByRole("button", { name: "Remove a.txt" }));

      expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
    });

    it("clears the selection when the last file is removed", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(
        <FileUpload
          onFileSelect={onFileSelect}
          initialFiles={[file("a.txt")]}
        />
      );

      await user.click(screen.getByRole("button", { name: "Remove a.txt" }));

      expect(onFileSelect).toHaveBeenLastCalledWith(null);
    });

    it("empties the input when the last file is removed", async () => {
      const user = userEvent.setup();
      render(<FileUpload onFileSelect={() => {}} label="Attachments" />);
      const input = screen.getByLabelText("Attachments");
      await user.upload(input, file("a.txt"));

      await user.click(screen.getByRole("button", { name: "Remove a.txt" }));

      expect(input).toHaveValue("");
    });

    it("offers the upload button again when the last file is removed", async () => {
      const user = userEvent.setup();
      render(
        <FileUpload onFileSelect={() => {}} initialFiles={[file("a.txt")]} />
      );

      await user.click(screen.getByRole("button", { name: "Remove a.txt" }));

      expect(screen.getByText("Upload File")).toBeVisible();
    });

    it("clears every file", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(
        <FileUpload
          onFileSelect={onFileSelect}
          initialFiles={[file("a.txt"), file("b.txt")]}
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear All" }));

      expect(onFileSelect).toHaveBeenLastCalledWith(null);
    });

    it("empties the input when cleared", async () => {
      const user = userEvent.setup();
      render(<FileUpload onFileSelect={() => {}} label="Attachments" />);
      const input = screen.getByLabelText("Attachments");
      await user.upload(input, file("a.txt"));

      await user.click(screen.getByRole("button", { name: "Clear All" }));

      expect(input).toHaveValue("");
    });

    it.todo(
      "decide what fileListPosition places the list relative to — currently the upload button is hidden whenever the list shows, so above and below render the same order"
    );
  });

  describe("renderFiles", () => {
    const Custom = ({ onFileSelect = () => {} }) => (
      <FileUpload
        onFileSelect={onFileSelect}
        label="Attachments"
        initialFiles={[file("a.txt"), file("b.txt")]}
        renderFiles={({ files, onRemove, onClear, onChange }) => (
          <div>
            {files.map((f, i) => (
              <button key={f.name} type="button" onClick={() => onRemove(i)}>
                Drop {f.name}
              </button>
            ))}
            <button type="button" onClick={onClear}>
              Empty
            </button>
            <button type="button" onClick={onChange}>
              Swap
            </button>
          </div>
        )}
      />
    );

    it("renders the selected files its own way", () => {
      render(<Custom />);

      expect(screen.getByRole("button", { name: "Drop b.txt" })).toBeVisible();
    });

    it("replaces the default list", () => {
      render(<Custom />);

      expect(
        screen.queryByRole("button", { name: "Clear All" })
      ).not.toBeInTheDocument();
    });

    it("removes a file through onRemove", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(<Custom onFileSelect={onFileSelect} />);

      await user.click(screen.getByRole("button", { name: "Drop a.txt" }));

      expect(onFileSelect).toHaveBeenLastCalledWith(named("b.txt"));
    });

    it("clears through onClear", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(<Custom onFileSelect={onFileSelect} />);

      await user.click(screen.getByRole("button", { name: "Empty" }));

      expect(onFileSelect).toHaveBeenLastCalledWith(null);
    });

    it("opens the picker through onChange", async () => {
      const user = userEvent.setup();
      const onPick = vi.fn();
      render(<Custom />);
      screen.getByLabelText("Attachments").addEventListener("click", onPick);

      await user.click(screen.getByRole("button", { name: "Swap" }));

      expect(onPick).toHaveBeenCalledTimes(1);
    });
  });

  describe("maxSize", () => {
    it("accepts a file at the limit", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(<FileUpload onFileSelect={onFileSelect} maxSize={1024} />);

      await user.upload(screen.getByLabelText("Upload File"), file("a", 1024));

      expect(onFileSelect).toHaveBeenCalledWith(named("a"));
    });

    it("rejects a file one byte over the limit", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(<FileUpload onFileSelect={onFileSelect} maxSize={1024} />);

      await user.upload(screen.getByLabelText("Upload File"), file("a", 1025));

      expect(onFileSelect).not.toHaveBeenCalled();
    });

    it("names only the oversized files", async () => {
      const user = userEvent.setup();
      render(<FileUpload onFileSelect={() => {}} maxSize={1024} multiple />);

      await user.upload(screen.getByLabelText("Upload Files"), [
        file("small.txt", 10),
        file("big.txt", 2048),
      ]);

      // The dialog is unnamed: Modal does not link its title to it.
      expect(
        within(screen.getByRole("dialog")).getByRole("listitem")
      ).toHaveTextContent("big.txt");
    });

    it("shows the limit", async () => {
      const user = userEvent.setup();
      render(<FileUpload onFileSelect={() => {}} maxSize={1536} />);

      await user.upload(screen.getByLabelText("Upload File"), file("a", 2048));

      expect(screen.getByRole("dialog")).toHaveTextContent(
        "Maximum allowed file size is 1.5 KB"
      );
    });

    it("keeps the previous selection", async () => {
      const user = userEvent.setup();
      render(
        <FileUpload
          onFileSelect={() => {}}
          label="Attachments"
          maxSize={1024}
          initialFiles={[file("old.txt")]}
        />
      );

      await user.upload(screen.getByLabelText("Attachments"), file("a", 2048));

      expect(screen.getByText("old.txt")).toBeVisible();
    });

    it.todo(
      "decide whether rejecting an oversized pick empties the input — currently the input still holds the rejected file while the list shows the previous selection"
    );

    it("closes the error", async () => {
      const user = userEvent.setup();
      render(<FileUpload onFileSelect={() => {}} maxSize={1024} />);
      await user.upload(screen.getByLabelText("Upload File"), file("a", 2048));

      await user.click(screen.getByRole("button", { name: "Close" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
    });
  });

  describe("allowDirectory", () => {
    it("offers no folder upload by default", () => {
      render(<FileUpload onFileSelect={() => {}} />);

      expect(screen.queryByText("Upload Folder")).not.toBeInTheDocument();
    });

    it("picks a directory", () => {
      render(<FileUpload onFileSelect={() => {}} allowDirectory />);

      expect(screen.getByLabelText("Upload Folder")).toHaveAttribute(
        "webkitdirectory"
      );
    });

    it("selects the files in an uploaded folder", async () => {
      const user = userEvent.setup();
      const onFileSelect = vi.fn();
      render(<FileUpload onFileSelect={onFileSelect} allowDirectory />);

      await user.upload(screen.getByLabelText("Upload Folder"), [
        file("a.txt"),
        file("b.txt"),
      ]);

      expect(onFileSelect).toHaveBeenCalledWith(named("a.txt", "b.txt"));
    });
  });
});
