import { hydrate, serverRender } from "../../../inputs/__tests__/hydration.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubScreen } from "../../../../hooks/__tests__/screen.js";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import AppTopBar, { AppTopBarLink } from "../index.js";
import { MemoryRouter, NavLink } from "react-router";

const bar = (navLabel?: string) => (
  <AppTopBar
    brand="Tereo"
    navLabel={navLabel}
    actions={<button type="button">User menu</button>}
  >
    <AppTopBarLink href="#users">Users</AppTopBarLink>
    <AppTopBarLink href="#docs">Docs</AppTopBarLink>
  </AppTopBar>
);

const menu = () => screen.getByRole("button", { name: "Menu" });

describe("AppTopBar", () => {
  afterEach(() => vi.unstubAllGlobals());

  describe("on a wide screen", () => {
    beforeEach(() => stubScreen(false));

    it("shows the links inline", () => {
      render(bar());

      expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
    });

    it("has no menu button", () => {
      render(bar());

      expect(
        screen.queryByRole("button", { name: "Menu" })
      ).not.toBeInTheDocument();
    });

    it.each([
      [undefined, "Menu"],
      ["Sections", "Sections"],
    ])("names the nav from navLabel=%s", (navLabel, name) => {
      render(bar(navLabel));

      expect(screen.getByRole("navigation", { name })).toBeVisible();
    });
  });

  describe("on a narrow screen", () => {
    beforeEach(() => stubScreen(true));

    it("folds the links behind a menu button", () => {
      render(bar());

      expect(
        screen.queryByRole("link", { name: "Docs" })
      ).not.toBeInTheDocument();
    });

    it("keeps the brand in the bar", () => {
      render(bar());

      expect(screen.getByText("Tereo")).toBeVisible();
    });

    it("keeps the actions in the bar", () => {
      render(bar());

      expect(screen.getByRole("button", { name: "User menu" })).toBeVisible();
    });

    it("opens the links from the menu button", async () => {
      const user = userEvent.setup();
      render(bar());

      await user.click(menu());

      expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
    });

    it("closes once a link is picked", async () => {
      const user = userEvent.setup();
      render(bar());
      await user.click(menu());

      await user.click(screen.getByRole("link", { name: "Docs" }));

      expect(menu()).toHaveAttribute("aria-expanded", "false");
    });

    it("closes on Escape", async () => {
      const user = userEvent.setup();
      render(bar());
      await user.click(menu());

      await user.keyboard("{Escape}");

      expect(menu()).toHaveAttribute("aria-expanded", "false");
    });

    it("returns focus to the menu button when Escape closes it from a link", async () => {
      const user = userEvent.setup();
      render(bar());
      await user.click(menu());
      screen.getByRole("link", { name: "Users" }).focus();

      await user.keyboard("{Escape}");

      expect(menu()).toHaveFocus();
    });
  });

  it("shows the links inline once a narrow screen widens", async () => {
    const viewport = stubScreen(true);
    render(bar());

    viewport.resize(false);

    expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
  });

  it("renders a link through `as`, such as a router NavLink", () => {
    stubScreen(false);

    render(
      <MemoryRouter initialEntries={["/users"]}>
        <AppTopBar brand="Tereo">
          <AppTopBarLink as={NavLink} to="/users">
            Users
          </AppTopBarLink>
        </AppTopBar>
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  describe.each([true, false])("server render, narrow=%s", (narrow) => {
    beforeEach(() => stubScreen(narrow));

    it("hydrates without a mismatch", async () => {
      const container = serverRender(bar());

      const { consoleError, onRecoverableError } = await hydrate(
        container,
        bar()
      );

      expect(consoleError).not.toHaveBeenCalled();
      expect(onRecoverableError).not.toHaveBeenCalled();
    });
  });
});
