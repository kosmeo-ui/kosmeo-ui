import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Breadcrumbs, { Breadcrumb } from "../index.js";
import { expect, it, vi } from "vitest";

const items: Breadcrumb[] = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Acme", path: "/projects/1" },
];

it("is a navigation landmark named breadcrumb", () => {
  render(<Breadcrumbs items={items} />);

  expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeVisible();
});

it("links every crumb but the last to its path", () => {
  render(<Breadcrumbs items={items} />);

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/"
  );
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "href",
    "/projects"
  );
});

it("shows the last crumb as text, not a link", () => {
  render(<Breadcrumbs items={items} />);

  expect(screen.getByText("Acme")).toBeVisible();
  expect(screen.queryByRole("link", { name: "Acme" })).not.toBeInTheDocument();
});

it("lets onClick take over navigation", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
  render(
    <Breadcrumbs
      items={[
        { label: "Home", path: "/", onClick },
        { label: "Here", path: "/here" },
      ]}
    />
  );

  await user.click(screen.getByRole("link", { name: "Home" }));

  expect(onClick).toHaveBeenCalledTimes(1);
});
