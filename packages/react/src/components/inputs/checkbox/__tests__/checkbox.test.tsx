import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "../index.js";

describe("Checkbox", () => {
  it("is labelled and reflects checked", () => {
    render(<Checkbox label="Agree" checked onChange={() => {}} />);

    expect(screen.getByRole("checkbox", { name: "Agree" })).toBeChecked();
  });

  it("calls onChange when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Agree" checked={false} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Agree" }));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("can be named with aria-label", () => {
    render(
      <Checkbox aria-label="Select row" checked={false} onChange={() => {}} />
    );

    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeVisible();
  });

  describe("read-only", () => {
    it("is announced as read-only", () => {
      render(<Checkbox label="Agree" checked={false} readOnly />);

      expect(screen.getByRole("checkbox", { name: "Agree" })).toHaveAttribute(
        "aria-readonly",
        "true"
      );
    });

    // jsdom toggles a cancelled checkbox instead of restoring it as browsers
    // do, so assert the cancellation rather than the checked state.
    it("cancels the click", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Checkbox label="Agree" checked={false} readOnly onClick={onClick} />
      );

      await user.click(screen.getByRole("checkbox", { name: "Agree" }));

      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ defaultPrevented: true })
      );
    });

    it("does not call onChange when clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Checkbox label="Agree" checked={false} readOnly onChange={onChange} />
      );

      await user.click(screen.getByRole("checkbox", { name: "Agree" }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it("won't toggle while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Checkbox label="Agree" checked={false} disabled onChange={onChange} />
    );

    await user.click(screen.getByRole("checkbox", { name: "Agree" }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
