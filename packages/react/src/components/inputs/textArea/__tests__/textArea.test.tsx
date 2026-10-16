import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TextArea from "../index.js";

describe("TextArea", () => {
  it("associates the label and applies rows and limits", () => {
    render(<TextArea label="Notes" rows={4} max={100} min={2} />);
    const textarea = screen.getByLabelText("Notes");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAttribute("maxlength", "100");
    expect(textarea).toHaveAttribute("minlength", "2");
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<TextArea label="Notes" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Notes"), "hi");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("shows a character count", () => {
    render(<TextArea value="abc" max={50} showCharCount />);
    expect(screen.getByText("3 / 50")).toBeInTheDocument();
  });

  it("is disabled when asked", () => {
    render(<TextArea label="Notes" disabled />);
    expect(screen.getByLabelText("Notes")).toBeDisabled();
  });
});
