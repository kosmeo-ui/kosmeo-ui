import { hydrate, serverRender } from "../../../inputs/__tests__/hydration.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubScreen } from "../../../../hooks/__tests__/screen.js";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import SectionLayout from "../index.js";

const layout = (collapsedStorageKey?: string) => (
  <SectionLayout
    title="Auth Admin"
    collapsedStorageKey={collapsedStorageKey}
    sidebar={
      <nav>
        <a href="#users">Users</a>
        <a href="#roles">Roles</a>
      </nav>
    }
  >
    <p>Users page</p>
  </SectionLayout>
);

/** Renders as a server does: with no localStorage, so no stored collapse. */
const serverRenderWithoutStorage = () => {
  const storage = localStorage;
  vi.stubGlobal("localStorage", undefined);
  const container = serverRender(layout());
  vi.stubGlobal("localStorage", storage);
  return container;
};

const toggle = () => screen.getByRole("button", { name: "Auth Admin" });
const sidebar = () =>
  screen.getByRole("complementary", { name: "Auth Admin", hidden: true });

describe("SectionLayout", () => {
  afterEach(() => vi.unstubAllGlobals());

  describe("on a wide screen", () => {
    beforeEach(() => stubScreen(false));

    it("shows the sidebar's links", () => {
      render(layout());

      expect(screen.getByRole("link", { name: "Roles" })).toBeVisible();
    });

    it("shows the content", () => {
      render(layout());

      expect(screen.getByText("Users page")).toBeVisible();
    });

    it("has no drawer toggle", () => {
      render(layout());

      expect(
        screen.queryByRole("button", { name: "Auth Admin" })
      ).not.toBeInTheDocument();
    });

    it("collapses the sidebar", async () => {
      const user = userEvent.setup();
      render(layout());

      await user.click(
        screen.getByRole("button", { name: "Collapse sidebar" })
      );

      expect(
        screen.getByRole("button", { name: "Expand sidebar" })
      ).toHaveAttribute("aria-expanded", "false");
    });

    it("remembers the collapse under collapsedStorageKey", async () => {
      const user = userEvent.setup();
      render(layout("t-sidebar-collapsed"));

      await user.click(
        screen.getByRole("button", { name: "Collapse sidebar" })
      );

      expect(localStorage.getItem("t-sidebar-collapsed")).toBe("true");
    });

    it("starts collapsed when a collapse is stored", () => {
      localStorage.setItem("t-sidebar-collapsed", "true");

      render(layout("t-sidebar-collapsed"));

      expect(
        screen.getByRole("button", { name: "Expand sidebar" })
      ).toBeVisible();
    });
  });

  describe("on a narrow screen", () => {
    beforeEach(() => stubScreen(true));

    it("starts with the drawer closed", () => {
      render(layout());

      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps the closed drawer's links out of the tab order", () => {
      render(layout());

      expect(sidebar()).toHaveAttribute("inert");
    });

    it("has no collapse button", () => {
      render(layout());

      expect(
        screen.queryByRole("button", { name: "Collapse sidebar", hidden: true })
      ).not.toBeInTheDocument();
    });

    it("opens the drawer from the toggle", async () => {
      const user = userEvent.setup();
      render(layout());

      await user.click(toggle());

      expect(sidebar()).not.toHaveAttribute("inert");
    });

    it("closes the drawer once a link is followed", async () => {
      const user = userEvent.setup();
      render(layout());
      await user.click(toggle());

      await user.click(screen.getByRole("link", { name: "Roles" }));

      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });

    it("closes the drawer on Escape", async () => {
      const user = userEvent.setup();
      render(layout());
      await user.click(toggle());

      await user.keyboard("{Escape}");

      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });

    it("returns focus to the toggle when Escape closes the drawer from a link", async () => {
      const user = userEvent.setup();
      render(layout());
      await user.click(toggle());
      screen.getByRole("link", { name: "Roles" }).focus();

      await user.keyboard("{Escape}");

      expect(toggle()).toHaveFocus();
    });

    it("closes the drawer from the backdrop", async () => {
      const user = userEvent.setup();
      const { container } = render(layout());
      await user.click(toggle());

      // A click target with no role by design, like the modal backdrop.
      await user.click(container.querySelector(".k-section-layout-backdrop")!);

      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe.each([true, false])(
    "server render with a stored collapse, narrow=%s",
    (narrow) => {
      beforeEach(() => {
        stubScreen(narrow);
        localStorage.setItem("k-section-layout-collapsed", "true");
      });

      it("hydrates without a mismatch", async () => {
        const container = serverRenderWithoutStorage();

        const { consoleError, onRecoverableError } = await hydrate(
          container,
          layout()
        );

        expect(consoleError).not.toHaveBeenCalled();
        expect(onRecoverableError).not.toHaveBeenCalled();
      });
    }
  );

  it("applies a stored collapse once hydrated", async () => {
    stubScreen(false);
    localStorage.setItem("k-section-layout-collapsed", "true");
    const container = serverRenderWithoutStorage();

    await hydrate(container, layout());

    expect(
      screen.getByRole("button", { name: "Expand sidebar" })
    ).toBeVisible();
  });
});
