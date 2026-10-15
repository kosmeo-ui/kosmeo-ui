import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Button from "../../../buttons/button/index.js";
import { describe, expect, it, vi } from "vitest";
import Modal from "../index.js";

const overlay = () => document.querySelector(".k-modal-overlay")!;

describe("Modal", () => {
  it("renders nothing while hidden", () => {
    render(<Modal show={false} onClose={() => {}} title="Hi" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a modal dialog with title, body and a default Close button", async () => {
    const onClose = vi.fn();
    render(
      <Modal show onClose={onClose} title="Settings" size="lg">
        Body text
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveClass("k-modal-content", "lg");
    expect(dialog).toHaveTextContent("Settings");
    expect(dialog).toHaveTextContent("Body text");

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders footerButtons in place of Close", () => {
    render(
      <Modal
        show
        onClose={() => {}}
        footerButtons={[<Button key="a">Save</Button>]}
      />
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("closes on Escape and on a backdrop click", async () => {
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} />);

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(overlay());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("ignores a click inside the dialog and a drag that ends on the backdrop", () => {
    const onClose = vi.fn();
    render(
      <Modal show onClose={onClose}>
        Content
      </Modal>
    );

    fireEvent.click(screen.getByText("Content"));
    fireEvent.mouseDown(screen.getByText("Content"));
    fireEvent.click(overlay());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("can't be dismissed by Escape or backdrop when not dismissible", async () => {
    const onClose = vi.fn();
    render(<Modal show onClose={onClose} dismissible={false} />);

    await userEvent.keyboard("{Escape}");
    await userEvent.click(overlay());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("traps focus inside the dialog", async () => {
    render(
      <Modal
        show
        onClose={() => {}}
        footerButtons={[<Button key="a">A</Button>, <Button key="b">B</Button>]}
      />
    );
    expect(screen.getByRole("button", { name: "A" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "A" })).toHaveFocus();
  });

  it("unmounts after the close animation", () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(<Modal show onClose={() => {}} />);
      rerender(<Modal show={false} onClose={() => {}} />);
      expect(screen.getByRole("dialog")).toHaveClass("closing");

      act(() => vi.advanceTimersByTime(200));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
