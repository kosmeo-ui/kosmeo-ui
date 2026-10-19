import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TagCard from "../index.js";

describe("TagCard", () => {
  it("titles the card with a heading", () => {
    render(<TagCard title="Skills" tags={["React"]} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Skills" })
    ).toBeVisible();
  });

  it("lists every tag in order", () => {
    render(<TagCard title="Skills" tags={["React", "CSS", "Node"]} />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent)
    ).toEqual(["React", "CSS", "Node"]);
  });

  // The badge's root is a role-less span whose classes carry the colour.
  it.each([
    [undefined, "k-badge k-badge-primary k-badge-md k-badge-pill"],
    ["secondary" as const, "k-badge k-badge-secondary k-badge-md k-badge-pill"],
  ])("colours the tags for color %s", (color, classes) => {
    render(<TagCard title="Skills" tags={["React"]} color={color} />);

    expect(screen.getByText("React").parentElement).toHaveClass(classes, {
      exact: true,
    });
  });

  it("shows emptyText instead of a list when there are no tags", () => {
    render(<TagCard title="Skills" tags={[]} emptyText="No skills yet" />);

    expect(screen.getByText("No skills yet")).toBeVisible();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders no list when there are no tags and no emptyText", () => {
    render(<TagCard title="Skills" tags={[]} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders a repeated tag as many times as it is given", () => {
    render(<TagCard title="Skills" tags={["React", "React"]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("keeps a repeated tag in place when the tags change", () => {
    const { rerender } = render(
      <TagCard title="Skills" tags={["React", "Go", "React"]} />
    );

    rerender(<TagCard title="Skills" tags={["Go", "React"]} />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent)
    ).toEqual(["Go", "React"]);
  });
});
