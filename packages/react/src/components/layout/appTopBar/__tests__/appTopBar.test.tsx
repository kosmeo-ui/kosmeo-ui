import { hydrate, serverRender } from "../../../inputs/__tests__/hydration.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { stubScreen } from "../../../../hooks/__tests__/screen.js";
import { userEvent } from "@testing-library/user-event";
import AppTopBar, { AppTopBarLink } from "../index.js";
import { MemoryRouter, NavLink } from "react-router";

const LINK_WIDTH = 100;
const MENU_BUTTON_WIDTH = 44;

const bar = (navLabel?: string, links = ["Users", "Docs"]) => (
  <AppTopBar
    brand="Tereo"
    navLabel={navLabel}
    actions={<button type="button">User menu</button>}
  >
    {links.map((link) => (
      <AppTopBarLink key={link} href={`#${link}`}>
        {link}
      </AppTopBarLink>
    ))}
  </AppTopBar>
);

const menu = () => screen.getByRole("button", { name: "Menu" });

/**
 * Lays the bar out as a browser would, which jsdom can't: `room` is the space
 * between the brand and the actions, each link is LINK_WIDTH wide, and the
 * menu button takes MENU_BUTTON_WIDTH of the room while it shows. Elements
 * are told apart by class, as the stylesheet does, since the room has no role.
 */
const stubLayout = (room: number) => {
  const observers = new Set<() => void>();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        observers.add(this.callback);
      }
      unobserve() {}
      disconnect() {
        observers.delete(this.callback);
      }
    }
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      const hasButton = !!this.closest("header")?.querySelector(
        ".k-app-top-bar-menu-button"
      );
      const width = this.classList.contains("k-app-top-bar-nav-slot")
        ? room - (hasButton ? MENU_BUTTON_WIDTH : 0)
        : this.classList.contains("k-app-top-bar-nav")
          ? this.hidden
            ? 0
            : this.childElementCount * LINK_WIDTH
          : this.classList.contains("k-app-top-bar-menu-button")
            ? MENU_BUTTON_WIDTH
            : 0;
      return DOMRect.fromRect({ width });
    }
  );
  return {
    /** Reports a new room to the observers, as a window or an action resizing does. */
    resize: (to: number = room) =>
      act(() => {
        room = to;
        observers.forEach((observer) => observer());
      }),
  };
};

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

  describe.each([
    ["on a narrow screen", () => stubScreen(true)],
    [
      "on a wide screen, with links wider than the room",
      () => {
        stubScreen(false);
        stubLayout(150);
      },
    ],
  ])("%s", (_, setUp) => {
    beforeEach(setUp);

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

  describe("on a wide screen, measuring the links", () => {
    beforeEach(() => stubScreen(false));

    it("keeps the links inline when the room is exactly their width", () => {
      stubLayout(2 * LINK_WIDTH);

      render(bar());

      expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
    });

    it("folds the links when they are a pixel wider than the room", () => {
      stubLayout(2 * LINK_WIDTH - 1);

      render(bar());

      expect(menu()).toBeVisible();
    });

    it("folds the links once the room shrinks, as when an action appears", () => {
      const layout = stubLayout(300);
      render(bar());

      layout.resize(2 * LINK_WIDTH - 1);

      expect(menu()).toBeVisible();
    });

    it("unfolds once the room is as wide as the links were", () => {
      const layout = stubLayout(150);
      render(bar());

      layout.resize(2 * LINK_WIDTH);

      expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
    });

    it("stays folded while the room is narrower than the links were, though folded links take none", () => {
      const layout = stubLayout(150);
      render(bar());

      layout.resize(2 * LINK_WIDTH - 1);

      expect(menu()).toBeVisible();
    });

    it("folds the links once more arrive than fit", () => {
      const layout = stubLayout(250);
      const { rerender } = render(bar());
      rerender(bar(undefined, ["Users", "Docs", "Billing"]));

      layout.resize();

      expect(menu()).toBeVisible();
    });

    it("unfolds once links leave while folded and the rest fit", async () => {
      stubLayout(250);
      const { rerender } = render(bar(undefined, ["Users", "Docs", "Billing"]));

      rerender(bar());
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Menu" })
        ).not.toBeInTheDocument()
      );

      expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
    });
  });

  it("folds the links on a narrow screen even when they fit", () => {
    stubScreen(true);
    stubLayout(1000);

    render(bar());

    expect(
      screen.queryByRole("link", { name: "Docs" })
    ).not.toBeInTheDocument();
  });

  it("shows the links inline once a narrow screen widens", async () => {
    const viewport = stubScreen(true);
    render(bar());

    viewport.resize(false);

    expect(screen.getByRole("link", { name: "Docs" })).toBeVisible();
  });

  it("keeps the links folded when a narrow screen widens but they still don't fit", () => {
    const viewport = stubScreen(true);
    stubLayout(150);
    render(bar());

    viewport.resize(false);

    expect(menu()).toBeVisible();
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

  describe("server render, with links wider than the room", () => {
    beforeEach(() => {
      stubScreen(false);
      stubLayout(150);
    });

    it("hydrates without a mismatch", async () => {
      const container = serverRender(bar());

      const { consoleError, onRecoverableError } = await hydrate(
        container,
        bar()
      );

      expect(consoleError).not.toHaveBeenCalled();
      expect(onRecoverableError).not.toHaveBeenCalled();
    });

    it("folds the links once hydrated", async () => {
      const container = serverRender(bar());

      await hydrate(container, bar());

      expect(menu()).toBeVisible();
    });
  });
});
