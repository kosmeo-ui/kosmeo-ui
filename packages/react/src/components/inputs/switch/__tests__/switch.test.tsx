import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Switch from "../index.js";

describe("Switch", () => {
  it("is a labelled checkbox reflecting checked", () => {
    render(<Switch label="Dark mode" checked onChange={() => {}} />);
    expect(screen.getByLabelText("Dark mode")).toBeChecked();
  });

  it("calls onChange when toggled", async () => {
    const onChange = vi.fn();
    render(<Switch label="Dark mode" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Dark mode"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled while loading", async () => {
    const onChange = vi.fn();
    render(
      <Switch label="Dark mode" checked={false} onChange={onChange} isLoading />
    );
    const input = screen.getByLabelText("Dark mode");
    expect(input).toBeDisabled();
    await userEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the label on the chosen side", () => {
    const { container } = render(
      <Switch label="Left" labelLocation="left" checked onChange={() => {}} />
    );
    expect(container.firstElementChild?.firstElementChild).toHaveTextContent(
      "Left"
    );
  });
});
