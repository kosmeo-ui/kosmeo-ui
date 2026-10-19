import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ListRow from "../index.js";

describe("ListRow", () => {
  it("renders its children", () => {
    render(<ListRow>Invoice #42</ListRow>);

    expect(screen.getByText("Invoice #42")).toBeVisible();
  });

  it("renders the actions", () => {
    render(
      <ListRow actions={<button type="button">Delete</button>}>
        Invoice #42
      </ListRow>
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
  });
});
