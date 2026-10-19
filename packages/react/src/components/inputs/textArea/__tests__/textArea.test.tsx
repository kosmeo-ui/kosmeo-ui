import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TextArea from "../index.js";

describe("TextArea", () => {
  it("is named by its label", () => {
    render(<TextArea label="Notes" />);

    expect(screen.getByRole("textbox", { name: "Notes" })).toBeVisible();
  });

  it.each([
    ["rows", "4"],
    ["maxlength", "100"],
    ["minlength", "2"],
  ])("sets %s from its props", (attribute, value) => {
    render(<TextArea label="Notes" rows={4} max={100} min={2} />);

    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute(
      attribute,
      value
    );
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextArea label="Notes" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Notes" }), "hi");

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("shows a character count", () => {
    render(<TextArea value="abc" max={50} showCharCount />);

    expect(screen.getByText("3 / 50")).toBeVisible();
  });

  it("is disabled when asked", () => {
    render(<TextArea label="Notes" disabled />);

    expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
  });
});
