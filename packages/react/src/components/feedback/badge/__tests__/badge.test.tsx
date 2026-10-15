import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Badge from "../index.js";

describe("Badge", () => {
  it("renders a span with the default classes", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New").parentElement!;
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveClass(
      "k-badge",
      "k-badge-primary",
      "k-badge-md",
      "k-badge-pill"
    );
  });

  it("applies subtle and square styling", () => {
    render(
      <Badge pill={false} subtle>
        New
      </Badge>
    );
    const badge = screen.getByText("New").parentElement!;
    expect(badge).toHaveClass("k-badge-subtle");
    expect(badge).not.toHaveClass("k-badge-pill");
  });

  it("renders as a button when clickable", async () => {
    const onClick = vi.fn();
    render(
      <Badge onClick={onClick} ariaLabel="Filter by new">
        New
      </Badge>
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Filter by new" })
    );
    expect(onClick).toHaveBeenCalled();
  });

  it("removes without triggering the badge's own click", async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Badge onClick={onClick} onRemove={onRemove}>
        New
      </Badge>
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("colours a custom badge with contrasting text", () => {
    render(
      <Badge variant="custom" color="#000000">
        Dark
      </Badge>
    );
    expect(screen.getByText("Dark").parentElement).toHaveStyle({
      backgroundColor: "#000000",
      color: "var(--text-color-light)",
    });
  });

  it("throws when custom has no colour", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Badge variant="custom">Oops</Badge>)).toThrow(
      /requires a `color` prop/
    );
  });
});
