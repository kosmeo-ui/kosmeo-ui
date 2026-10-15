import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "../index.js";

describe("Checkbox", () => {
  it("is labelled and reflects checked", () => {
    render(<Checkbox label="Agree" checked onChange={() => {}} />);
    expect(screen.getByLabelText("Agree")).toBeChecked();
  });

  it("calls onChange when clicked", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Agree" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Agree"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("can be named with aria-label", () => {
    render(<Checkbox aria-label="Select row" checked={false} />);
    expect(
      screen.getByRole("checkbox", { name: "Select row" })
    ).toBeInTheDocument();
  });

  it("won't toggle while read-only", () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Checkbox
        label="Agree"
        checked={false}
        readOnly
        onChange={onChange}
        onClick={onClick}
      />
    );
    const checkbox = screen.getByLabelText("Agree");
    expect(checkbox).toHaveAttribute("aria-readonly", "true");

    // jsdom toggles a cancelled checkbox instead of restoring it as browsers
    // do, so assert the cancellation rather than the checked state.
    expect(fireEvent.click(checkbox)).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
  });

  it("won't toggle while disabled", async () => {
    const onChange = vi.fn();
    render(
      <Checkbox label="Agree" checked={false} disabled onChange={onChange} />
    );
    await userEvent.click(screen.getByLabelText("Agree"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
