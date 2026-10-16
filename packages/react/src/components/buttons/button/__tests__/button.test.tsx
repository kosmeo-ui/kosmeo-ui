import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button, { ButtonProps } from "../index.js";
import { createRef } from "react";

describe("Button", () => {
  it("defaults to type=button", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it.each<[string, Partial<ButtonProps>, string]>([
    [
      "the defaults",
      {},
      "k-button k-button-primary k-button-md k-button-center k-button-shadow k-button-auto-width",
    ],
    [
      "variant",
      { variant: "danger" },
      "k-button k-button-danger k-button-md k-button-center k-button-shadow k-button-auto-width",
    ],
    [
      "size",
      { size: "lg" },
      "k-button k-button-primary k-button-lg k-button-center k-button-shadow k-button-auto-width",
    ],
    [
      "align",
      { align: "left" },
      "k-button k-button-primary k-button-md k-button-left k-button-shadow k-button-auto-width",
    ],
    [
      "shadow={false}",
      { shadow: false },
      "k-button k-button-primary k-button-md k-button-center k-button-auto-width",
    ],
    [
      "fullWidth",
      { fullWidth: true },
      "k-button k-button-primary k-button-md k-button-center k-button-shadow k-button-full-width",
    ],
  ])("maps %s to classes", (_, props, classes) => {
    render(<Button {...props}>Go</Button>);

    expect(screen.getByRole("button", { name: "Go" })).toHaveClass(classes, {
      exact: true,
    });
  });

  it("calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);

    await user.click(screen.getByRole("button", { name: "Go" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Go</Button>);

    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
  });

  it("doesn't call onClick while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>
    );

    await user.click(screen.getByRole("button", { name: "Go" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("is busy and disabled while loading but keeps its accessible name", () => {
    render(<Button isLoading>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("passes through type, form and aria attributes", () => {
    render(
      <Button
        type="submit"
        form="f"
        aria-label="Submit form"
        aria-pressed
        title="tip"
      >
        Go
      </Button>
    );

    const button = screen.getByRole("button", { name: "Submit form" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("form", "f");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("title", "tip");
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLButtonElement>();

    render(<Button ref={ref}>Go</Button>);

    expect(ref.current).toBe(screen.getByRole("button", { name: "Go" }));
  });
});
