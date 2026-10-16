import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import Breadcrumbs from "../index.js";

it("links every crumb but the last", () => {
  render(
    <Breadcrumbs
      items={[
        { label: "Home", path: "/" },
        { label: "Projects", path: "/projects" },
        { label: "Acme", path: "/projects/1" },
      ]}
    />
  );
  expect(
    screen.getByRole("navigation", { name: "breadcrumb" })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "href",
    "/projects"
  );
  expect(screen.queryByRole("link", { name: "Acme" })).toBeNull();
  expect(screen.getByText("Acme")).toBeInTheDocument();
});

it("lets onClick take over navigation", async () => {
  const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
  render(
    <Breadcrumbs
      items={[
        { label: "Home", path: "/", onClick },
        { label: "Here", path: "/here" },
      ]}
    />
  );
  await userEvent.click(screen.getByRole("link", { name: "Home" }));
  expect(onClick).toHaveBeenCalled();
});
