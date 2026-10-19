import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Switch from "../index.js";

describe("Switch", () => {
  it("is a labelled checkbox reflecting checked", () => {
    render(<Switch label="Dark mode" checked onChange={() => {}} />);

    expect(screen.getByRole("checkbox", { name: "Dark mode" })).toBeChecked();
  });

  it("calls onChange when toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Dark mode" checked={false} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Dark mode" }));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled while loading", () => {
    render(
      <Switch label="Dark mode" checked={false} onChange={() => {}} isLoading />
    );

    expect(screen.getByRole("checkbox", { name: "Dark mode" })).toBeDisabled();
  });

  it("does not call onChange when clicked while loading", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Switch label="Dark mode" checked={false} onChange={onChange} isLoading />
    );

    await user.click(screen.getByRole("checkbox", { name: "Dark mode" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  // The label comes before the switch in reading order when it's on the left.
  it.each([
    ["left", Node.DOCUMENT_POSITION_FOLLOWING],
    ["right", Node.DOCUMENT_POSITION_PRECEDING],
  ] as const)(
    "renders the label on the %s",
    (labelLocation, switchPosition) => {
      render(
        <Switch
          label="Dark mode"
          labelLocation={labelLocation}
          checked
          onChange={() => {}}
        />
      );

      expect(
        screen
          .getByText("Dark mode")
          .compareDocumentPosition(
            screen.getByRole("checkbox", { name: "Dark mode" })
          )
      ).toBe(switchPosition);
    }
  );
});
