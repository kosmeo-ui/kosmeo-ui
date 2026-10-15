import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import Input from "../index.js";

describe("Input", () => {
  it("associates the label with the input", () => {
    render(<Input label="Name" />);
    expect(screen.getByLabelText("Name")).toHaveClass("k-input", "k-input-md");
  });

  it("marks required fields", () => {
    render(<Input label="Name" required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "abc");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("shows error instead of helper text", () => {
    const { rerender } = render(<Input helperText="Help" />);
    expect(screen.getByText("Help")).toBeInTheDocument();

    rerender(<Input helperText="Help" error="Bad" />);
    expect(screen.getByText("Bad")).toBeInTheDocument();
    expect(screen.queryByText("Help")).not.toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(
      screen.getByRole("button", { name: "Show password" })
    );
    expect(input).toHaveAttribute("type", "text");

    await userEvent.click(
      screen.getByRole("button", { name: "Hide password" })
    );
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders prefix and suffix addons", () => {
    render(<Input prefix="$" suffix="USD" />);
    expect(screen.getByText("$")).toHaveClass("k-input-addon-prefix");
    expect(screen.getByText("USD")).toHaveClass("k-input-addon-suffix");
    expect(screen.getByRole("textbox")).toHaveClass(
      "k-input-with-prefix",
      "k-input-with-suffix"
    );
  });

  it("shows a character count for text inputs", () => {
    render(<Input label="Bio" value="hello" max={10} showCharCount />);
    expect(screen.getByText("5 / 10")).toBeInTheDocument();
  });

  describe("onClear", () => {
    const Clearable = () => {
      const [value, setValue] = useState("text");
      return (
        <Input
          label="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue("")}
        />
      );
    };

    it("clears the value and keeps focus in the field", async () => {
      render(<Clearable />);
      await userEvent.click(screen.getByRole("button", { name: "Clear" }));

      const input = screen.getByLabelText("Search");
      expect(input).toHaveValue("");
      expect(input).toHaveFocus();
      expect(
        screen.queryByRole("button", { name: "Clear" })
      ).not.toBeInTheDocument();
    });

    it("is hidden when disabled or read-only", () => {
      const { rerender } = render(
        <Input value="x" onClear={() => {}} disabled />
      );
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();

      rerender(<Input value="x" onClear={() => {}} readOnly />);
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });
  });
});
