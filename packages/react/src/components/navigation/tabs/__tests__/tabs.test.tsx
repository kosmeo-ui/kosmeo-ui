import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Tabs, { TabItem } from "../index.js";

const tabs: TabItem[] = [
  { key: "one", label: "One", content: "First panel" },
  { key: "two", label: "Two", content: "Second panel" },
  { key: "three", label: "Three", disabled: true },
];

describe("Tabs", () => {
  it("marks the active tab and shows its panel", () => {
    render(<Tabs tabs={tabs} active="two" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
  });

  it("reports the clicked tab", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(onChange).toHaveBeenCalledWith("two");
  });

  it("doesn't report a disabled tab", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Three" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders only the strip with stripOnly", () => {
    render(<Tabs tabs={tabs} active="one" onChange={() => {}} stripOnly />);
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  });
});
