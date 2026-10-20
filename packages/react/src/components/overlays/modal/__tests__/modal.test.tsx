import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MultiSelect from "../../../inputs/multiSelect/index.js";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Button from "../../../buttons/button/index.js";
import Modal from "../index.js";

// The backdrop has no role by design.
const overlay = () => document.querySelector(".k-modal-overlay")!;

describe("Modal", () => {
  it("renders nothing while hidden", () => {
    render(<Modal show={false} onClose={() => {}} title="Hi" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a modal dialog", () => {
    render(<Modal show onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("is named by its title", () => {
    render(<Modal show onClose={() => {}} title="Settings" />);

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();
  });

  it("maps size to a class", () => {
    render(<Modal show onClose={() => {}} size="lg" />);

    expect(screen.getByRole("dialog")).toHaveClass("k-modal-content lg", {
      exact: true,
    });
  });

  it("shows the title and body", () => {
    render(
      <Modal show onClose={() => {}} title="Settings">
        Body text
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Settings");
    expect(dialog).toHaveTextContent("Body text");
  });

  it("closes from the default Close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders footerButtons in place of Close", () => {
    render(
      <Modal
        show
        onClose={() => {}}
        footerButtons={[<Button key="a">Save</Button>]}
      />
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Close" })
    ).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("with a dropdown inside", () => {
    const options = [{ name: "Created" }, { name: "Deleted" }];

    it("closes only the open list on Escape", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal show onClose={onClose}>
          <MultiSelect label="Events" options={options} labelKey="name" />
        </Modal>
      );
      await user.click(screen.getByRole("combobox", { name: "Events" }));

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("closes on Escape while the list is closed", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal show onClose={onClose}>
          <MultiSelect label="Events" options={options} labelKey="name" />
        </Modal>
      );
      await user.click(screen.getByRole("combobox", { name: "Events" }));
      await user.keyboard("{Escape}");

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("closes on a backdrop click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} />);

    await user.click(overlay());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores a click inside the dialog", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal show onClose={onClose}>
        Content
      </Modal>
    );

    await user.click(screen.getByText("Content"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores a drag that starts in the dialog and ends on the backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal show onClose={onClose}>
        Content
      </Modal>
    );

    await user.pointer([
      { keys: "[MouseLeft>]", target: screen.getByText("Content") },
      { target: overlay() },
      { keys: "[/MouseLeft]" },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores Escape when not dismissible", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} dismissible={false} />);

    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores a backdrop click when not dismissible", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} dismissible={false} />);

    await user.click(overlay());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("focuses the first button when opened", () => {
    render(
      <Modal
        show
        onClose={() => {}}
        footerButtons={[<Button key="a">A</Button>, <Button key="b">B</Button>]}
      />
    );

    expect(screen.getByRole("button", { name: "A" })).toHaveFocus();
  });

  it("wraps Tab from the last button back to the first", async () => {
    const user = userEvent.setup();
    render(
      <Modal
        show
        onClose={() => {}}
        footerButtons={[<Button key="a">A</Button>, <Button key="b">B</Button>]}
      />
    );

    await user.tab();
    await user.tab();

    expect(screen.getByRole("button", { name: "A" })).toHaveFocus();
  });

  describe("closing", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("marks the dialog closing while it animates out", () => {
      const { rerender } = render(<Modal show onClose={() => {}} />);

      rerender(<Modal show={false} onClose={() => {}} />);

      expect(screen.getByRole("dialog")).toHaveClass(
        "k-modal-content closing md",
        { exact: true }
      );
    });

    it("unmounts after the close animation", async () => {
      const { rerender } = render(<Modal show onClose={() => {}} />);

      rerender(<Modal show={false} onClose={() => {}} />);
      await act(() => vi.advanceTimersByTimeAsync(200));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
