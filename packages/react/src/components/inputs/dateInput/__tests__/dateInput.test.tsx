import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "../index.js";

describe("DateInput", () => {
  it("shows a date-only value on its calendar day", () => {
    render(<DateInput label="Start" value="2026-10-14" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Start")).toHaveValue("2026-10-14");
  });

  it("reports the picked day as yyyy-mm-dd", () => {
    const onChange = vi.fn();
    render(<DateInput label="Start" value={null} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "2026-12-25" },
    });
    expect(onChange).toHaveBeenCalledWith("2026-12-25");
  });

  it("reports null when cleared", () => {
    const onChange = vi.fn();
    render(<DateInput label="Start" value="2026-10-14" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Start"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
