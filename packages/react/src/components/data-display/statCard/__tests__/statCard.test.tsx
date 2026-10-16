import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import StatCard, { StatCardProps } from "../index.js";
import { describe, expect, it, vi } from "vitest";

const icon = <span>★</span>;

describe("StatCard", () => {
  it("shows the value and label", () => {
    render(<StatCard label="Orders" value={42} />);

    expect(screen.getByText("42")).toBeVisible();
    expect(screen.getByText("Orders")).toBeVisible();
  });

  it("is neither a link nor a button without href or onClick", () => {
    render(<StatCard label="Orders" value={42} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a link to href, named by its value and label", () => {
    render(<StatCard label="Orders" value={42} href="/orders" />);

    expect(screen.getByRole("link", { name: "42 Orders" })).toHaveAttribute(
      "href",
      "/orders"
    );
  });

  it("renders a button when only onClick is set", () => {
    render(<StatCard label="Orders" value={42} onClick={() => {}} />);

    expect(screen.getByRole("button", { name: "42 Orders" })).toBeVisible();
  });

  it("calls onClick when the button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatCard label="Orders" value={42} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "42 Orders" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when the link is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <StatCard label="Orders" value={42} href="#orders" onClick={onClick} />
    );

    await user.click(screen.getByRole("link", { name: "42 Orders" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Compact puts the label above the value, so it reads first in the name.
  it.each<[string, Partial<StatCardProps>, string, string]>([
    [
      "the default layout",
      {},
      "42 Orders",
      "k-stat-card k-stat-card-default k-stat-card-interactive",
    ],
    [
      "the compact layout",
      { compact: true },
      "Orders 42",
      "k-stat-card k-stat-card-compact k-stat-card-interactive",
    ],
  ])("maps %s to classes", (_, props, name, classes) => {
    render(<StatCard label="Orders" value={42} href="/orders" {...props} />);

    expect(screen.getByRole("link", { name })).toHaveClass(classes, {
      exact: true,
    });
  });

  // The icon tile is a role-less div whose classes are the iconVariant contract.
  it.each<[StatCardProps["iconVariant"], string]>([
    [undefined, "k-stat-card-icon k-stat-card-icon-primary"],
    ["danger", "k-stat-card-icon k-stat-card-icon-danger"],
  ])("colours the icon tile for iconVariant %s", (iconVariant, classes) => {
    render(
      <StatCard
        label="Orders"
        value={42}
        icon={icon}
        iconVariant={iconVariant}
      />
    );

    expect(screen.getByText("★").parentElement).toHaveClass(classes, {
      exact: true,
    });
  });

  it("renders the trailing element", () => {
    render(<StatCard label="Orders" value={42} trailing="›" />);

    expect(screen.getByText("›")).toBeVisible();
  });

  it.each<[string, Partial<StatCardProps>, string]>([
    ["icon", { icon }, "★"],
    ["trailing element", { trailing: "›" }, "›"],
  ])("leaves out the %s when compact", (_, props, text) => {
    render(<StatCard label="Orders" value={42} compact {...props} />);

    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
});
