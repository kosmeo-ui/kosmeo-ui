import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Alert from "../index.js";

describe("Alert", () => {
  it("maps variant and size to classes", () => {
    render(
      <Alert variant="danger" size="sm">
        Try again
      </Alert>
    );

    expect(screen.getByRole("alert")).toHaveClass(
      "k-alert k-alert-danger k-alert-sm",
      { exact: true }
    );
  });

  it("shows the heading and message", () => {
    render(<Alert heading="Failed">Try again</Alert>);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Failed");
    expect(alert).toHaveTextContent("Try again");
  });

  it("has no button unless dismissible", () => {
    render(<Alert>Note</Alert>);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onDismiss from the button", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss} buttonText="Got it">
        Note
      </Alert>
    );

    await user.click(screen.getByRole("button", { name: "Got it" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("labels the dismiss button Acknowledge by default", () => {
    render(<Alert dismissible>Note</Alert>);

    expect(screen.getByRole("button", { name: "Acknowledge" })).toBeVisible();
  });
});
