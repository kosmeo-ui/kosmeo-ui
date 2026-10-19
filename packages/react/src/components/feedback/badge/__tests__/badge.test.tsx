import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Badge, { BadgeProps } from "../index.js";

describe("Badge", () => {
  it("renders plain text, not a button, without onClick", () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText("New")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // The plain badge's root is a role-less span, reachable only from its text.
  it.each<[string, Partial<BadgeProps>, string]>([
    ["the defaults", {}, "k-badge k-badge-primary k-badge-md k-badge-pill"],
    [
      "subtle and square styling",
      { pill: false, subtle: true },
      "k-badge k-badge-primary k-badge-md k-badge-subtle",
    ],
  ])("maps %s to classes", (_, props, classes) => {
    render(<Badge {...props}>New</Badge>);

    expect(screen.getByText("New").parentElement).toHaveClass(classes, {
      exact: true,
    });
  });

  it("maps props to classes on a clickable badge", () => {
    render(
      <Badge onClick={() => {}} ariaLabel="Filter by new" size="sm">
        New
      </Badge>
    );

    expect(screen.getByRole("button", { name: "Filter by new" })).toHaveClass(
      "k-badge k-badge-primary k-badge-sm k-badge-pill k-badge-clickable",
      { exact: true }
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Badge onClick={onClick} ariaLabel="Filter by new">
        New
      </Badge>
    );

    await user.click(screen.getByRole("button", { name: "Filter by new" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the action and remove buttons separate when both are set", () => {
    render(
      <Badge onClick={() => {}} onRemove={() => {}} ariaLabel="Filter by new">
        New
      </Badge>
    );

    // A button inside a button is invalid HTML and breaks hydration.
    const action = screen.getByRole("button", { name: "Filter by new" });
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(action).not.toContainElement(remove);
    expect(remove).not.toContainElement(action);
  });

  it("puts the badge classes on the wrapper of a clickable, removable badge", () => {
    render(
      <Badge onClick={() => {}} onRemove={() => {}} ariaLabel="Filter by new">
        New
      </Badge>
    );

    // The wrapper is a role-less span, reachable only from its buttons.
    expect(
      screen.getByRole("button", { name: "Filter by new" }).parentElement
    ).toHaveClass(
      "k-badge k-badge-primary k-badge-md k-badge-pill k-badge-clickable",
      { exact: true }
    );
  });

  it("calls only onRemove from the remove button of a clickable badge", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Badge onClick={onClick} onRemove={onRemove} ariaLabel="Filter by new">
        New
      </Badge>
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls only onClick from the action button of a removable badge", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Badge onClick={onClick} onRemove={onRemove} ariaLabel="Filter by new">
        New
      </Badge>
    );

    await user.click(screen.getByRole("button", { name: "Filter by new" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("colours a custom badge with contrasting text", () => {
    render(
      <Badge variant="custom" color="#000000">
        Dark
      </Badge>
    );

    expect(screen.getByText("Dark").parentElement).toHaveStyle({
      backgroundColor: "#000000",
      color: "var(--k-text-color-light)",
    });
  });

  it("throws when custom has no colour", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Badge variant="custom">Oops</Badge>)).toThrow(
      /requires a `color` prop/
    );
  });

  it("keeps a remove click from reaching a clickable parent", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <div onClick={onRowClick}>
        <Badge onRemove={onRemove}>Tag</Badge>
      </div>
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
