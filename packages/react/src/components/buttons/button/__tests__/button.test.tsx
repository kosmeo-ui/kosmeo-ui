import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import Button from "../index.js";

describe("Button", () => {
  it("renders a type=button with the default classes", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(
      "k-button",
      "k-button-primary",
      "k-button-md",
      "k-button-center",
      "k-button-shadow",
      "k-button-auto-width"
    );
  });

  it("maps variant, size, align, shadow and fullWidth to classes", () => {
    render(
      <Button variant="danger" size="lg" align="left" shadow={false} fullWidth>
        Delete
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "k-button-danger",
      "k-button-lg",
      "k-button-left",
      "k-button-full-width"
    );
    expect(button).not.toHaveClass("k-button-shadow");
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("doesn't call onClick while disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>
    );
    await userEvent.click(screen.getByRole("button"));
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
    expect(ref.current).toBe(screen.getByRole("button"));
  });
});
