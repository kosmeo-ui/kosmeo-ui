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
  it("shows the body in a dialog", () => {
    render(<ConfirmationModal {...props()} />);

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "This can't be undone."
    );
  });

  it("confirms from the confirm button", async () => {
    const user = userEvent.setup();
    const p = props();
    render(<ConfirmationModal {...p} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(p.handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("hides from the cancel button, with its custom text", async () => {
    const user = userEvent.setup();
    const p = props({ cancelButtonText: "Keep" });
    render(<ConfirmationModal {...p} />);

    await user.click(screen.getByRole("button", { name: "Keep" }));

    expect(p.handleHide).toHaveBeenCalledTimes(1);
  });

  it("disables confirm until the confirmation text is typed", () => {
    render(<ConfirmationModal {...props({ confirmationText: "acme" })} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("keeps confirm disabled while the typed text only partly matches", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...props({ confirmationText: "acme" })} />);

    await user.type(screen.getByLabelText('Type "acme" to confirm'), "acm");

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("enables confirm once the confirmation text matches", async () => {
    const user = userEvent.setup();
    render(<ConfirmationModal {...props({ confirmationText: "acme" })} />);

    await user.type(screen.getByLabelText('Type "acme" to confirm'), "acme");

    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("confirms on Enter once the confirmation text matches", async () => {
    const user = userEvent.setup();
    const p = props({ confirmationText: "acme" });
    render(<ConfirmationModal {...p} />);

    await user.type(
      screen.getByLabelText('Type "acme" to confirm'),
      "acme{Enter}"
    );

    expect(p.handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("ignores Enter until the confirmation text matches", async () => {
    const user = userEvent.setup();
    const p = props({ confirmationText: "acme" });
    render(<ConfirmationModal {...p} />);

    await user.type(
      screen.getByLabelText('Type "acme" to confirm'),
      "acm{Enter}"
    );

    expect(p.handleConfirm).not.toHaveBeenCalled();
  });

  it("clears the typed text when reopened", async () => {
    const user = userEvent.setup();
    const p = props({ confirmationText: "acme" });
    const { rerender } = render(<ConfirmationModal {...p} />);
    await user.type(screen.getByLabelText('Type "acme" to confirm'), "acme");

    rerender(<ConfirmationModal {...p} show={false} />);
    rerender(<ConfirmationModal {...p} show />);

    expect(screen.getByLabelText('Type "acme" to confirm')).toHaveValue("");
  });

  it.each(["Cancel", "Delete"])("disables %s while loading", (name) => {
    render(<ConfirmationModal {...props({ isLoading: true })} />);

    expect(screen.getByRole("button", { name })).toBeDisabled();
  });

  it("ignores Escape while loading", async () => {
    const user = userEvent.setup();
    const p = props({ isLoading: true });
    render(<ConfirmationModal {...p} />);

    await user.keyboard("{Escape}");

    expect(p.handleHide).not.toHaveBeenCalled();
  });
});
