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
  it.each([
    ["Two", "true"],
    ["One", "false"],
  ])("marks tab %s selected=%s when Two is active", (name, selected) => {
    render(<Tabs tabs={tabs} active="two" onChange={() => {}} />);

    expect(screen.getByRole("tab", { name })).toHaveAttribute(
      "aria-selected",
      selected
    );
  });

  it("shows the active tab's panel", () => {
    render(<Tabs tabs={tabs} active="two" onChange={() => {}} />);

    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
  });

  it("reports the clicked tab", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Two" }));

    expect(onChange).toHaveBeenCalledWith("two");
  });

  it("disables a disabled tab", () => {
    render(<Tabs tabs={tabs} active="one" onChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Three" })).toBeDisabled();
  });

  it("doesn't report a disabled tab", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Three" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders only the strip with stripOnly", () => {
    render(<Tabs tabs={tabs} active="one" onChange={() => {}} stripOnly />);

    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  });
});
