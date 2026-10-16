import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import Input from "../index.js";

describe("Input", () => {
  it("is named by its label", () => {
    render(<Input label="Name" />);

    expect(screen.getByRole("textbox", { name: "Name" })).toBeVisible();
  });

  it("is medium-sized by default", () => {
    render(<Input label="Name" />);

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass(
      "k-input k-input-md",
      { exact: true }
    );
  });

  it("marks required fields", () => {
    render(<Input label="Name" required />);

    expect(screen.getByRole("textbox", { name: "Name" })).toBeRequired();
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "abc");

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("shows helper text", () => {
    render(<Input helperText="Help" />);

    expect(screen.getByText("Help")).toBeVisible();
  });

  it("shows an error", () => {
    render(<Input helperText="Help" error="Bad" />);

    expect(screen.getByText("Bad")).toBeVisible();
  });

  it("hides helper text while there is an error", () => {
    render(<Input helperText="Help" error="Bad" />);

    expect(screen.queryByText("Help")).not.toBeInTheDocument();
  });

  describe("password", () => {
    it("is masked by default", () => {
      render(<Input label="Password" type="password" />);

      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password"
      );
    });

    it("is revealed by the show button", async () => {
      const user = userEvent.setup();
      render(<Input label="Password" type="password" />);

      await user.click(screen.getByRole("button", { name: "Show password" }));

      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("is masked again by the hide button", async () => {
      const user = userEvent.setup();
      render(<Input label="Password" type="password" />);
      await user.click(screen.getByRole("button", { name: "Show password" }));

      await user.click(screen.getByRole("button", { name: "Hide password" }));

      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "type",
        "password"
      );
    });
  });

  describe("addons", () => {
    it.each([
      ["prefix", "$"],
      ["suffix", "USD"],
    ] as const)("renders the %s addon", (side, text) => {
      render(<Input label="Price" {...{ [side]: text }} />);

      expect(screen.getByText(text)).toHaveClass(
        `k-input-addon k-input-addon-${side} k-input-addon-md`,
        { exact: true }
      );
    });

    it("styles the input for both addons", () => {
      render(<Input label="Price" prefix="$" suffix="USD" />);

      expect(screen.getByRole("textbox", { name: "Price" })).toHaveClass(
        "k-input k-input-md k-input-with-addon k-input-with-prefix k-input-with-suffix",
        { exact: true }
      );
    });
  });

  it("shows a character count for text inputs", () => {
    render(<Input label="Bio" value="hello" max={10} showCharCount readOnly />);

    expect(screen.getByText("5 / 10")).toBeVisible();
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

    it("clears the value", async () => {
      const user = userEvent.setup();
      render(<Clearable />);

      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(screen.getByRole("textbox", { name: "Search" })).toHaveValue("");
    });

    it("keeps focus in the field", async () => {
      const user = userEvent.setup();
      render(<Clearable />);

      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus();
    });

    it("removes the clear button once the field is empty", async () => {
      const user = userEvent.setup();
      render(<Clearable />);

      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(
        screen.queryByRole("button", { name: "Clear" })
      ).not.toBeInTheDocument();
    });

    it.each(["disabled", "readOnly"])("is hidden when %s", (prop) => {
      render(<Input value="x" onClear={() => {}} {...{ [prop]: true }} />);

      expect(
        screen.queryByRole("button", { name: "Clear" })
      ).not.toBeInTheDocument();
    });
  });
});
