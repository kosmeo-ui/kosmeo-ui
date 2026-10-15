import ConfirmationModal, { ConfirmationModalProps } from "../index.js";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const props = (
  overrides: Partial<ConfirmationModalProps> = {}
): ConfirmationModalProps => ({
  show: true,
  handleHide: vi.fn(),
  handleConfirm: vi.fn(),
  title: "Delete project",
  body: "This can't be undone.",
  confirmButtonText: "Delete",
  ...overrides,
});

describe("ConfirmationModal", () => {
  it("confirms and cancels", async () => {
    const p = props({ cancelButtonText: "Keep" });
    render(<ConfirmationModal {...p} />);
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "This can't be undone."
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(p.handleConfirm).toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Keep" }));
    expect(p.handleHide).toHaveBeenCalled();
  });

  it("enables confirm only once the confirmation text matches", async () => {
    const p = props({ confirmationText: "acme" });
    render(<ConfirmationModal {...p} />);
    const confirm = screen.getByRole("button", { name: "Delete" });
    const input = screen.getByLabelText('Type "acme" to confirm');

    expect(confirm).toBeDisabled();
    await userEvent.type(input, "acm");
    expect(confirm).toBeDisabled();
    await userEvent.type(input, "e{Enter}");
    expect(confirm).toBeEnabled();
    expect(p.handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("clears the typed text when reopened", async () => {
    const p = props({ confirmationText: "acme" });
    const { rerender } = render(<ConfirmationModal {...p} />);
    await userEvent.type(screen.getByLabelText(/to confirm/), "acme");

    rerender(<ConfirmationModal {...p} show={false} />);
    rerender(<ConfirmationModal {...p} show />);
    expect(screen.getByLabelText(/to confirm/)).toHaveValue("");
  });

  it("locks both buttons and dismissal while loading", async () => {
    const p = props({ isLoading: true });
    render(<ConfirmationModal {...p} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(p.handleHide).not.toHaveBeenCalled();
  });
});
