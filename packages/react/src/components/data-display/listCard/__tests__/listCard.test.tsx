import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ListCard from "../index.js";

const items = [
  { label: "Status", value: "Active" },
  { label: "Plan", value: <strong>Pro</strong> },
];

describe("ListCard", () => {
  it("titles the card with a heading", () => {
    render(<ListCard listTitle="Account" items={items} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Account" })
    ).toBeVisible();
  });

  it("lists each label as a term", () => {
    render(<ListCard listTitle="Account" items={items} />);

    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(
      ["Status", "Plan"]
    );
  });

  it("lists each value as the definition of its term", () => {
    render(<ListCard listTitle="Account" items={items} />);

    expect(
      screen.getAllByRole("definition").map((value) => value.textContent)
    ).toEqual(["Active", "Pro"]);
  });

  it("renders the header actions beside the title", () => {
    render(
      <ListCard
        listTitle="Account"
        items={items}
        headerActions={<button type="button">Edit</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  it("keeps the title when header actions are set", () => {
    render(
      <ListCard
        listTitle="Account"
        items={items}
        headerActions={<button type="button">Edit</button>}
      />
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Account" })
    ).toBeVisible();
  });

  it("renders the footer buttons", () => {
    render(
      <ListCard
        listTitle="Account"
        items={items}
        footerButtons={<button type="button">Cancel plan</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Cancel plan" })).toBeVisible();
  });
});
