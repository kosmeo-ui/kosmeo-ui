import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Dropdown from "../index.js";
import { useState } from "react";

const trigger = (name = "Actions") => screen.getByRole("button", { name });
const item = () => screen.getByRole("button", { name: "Edit" });
/**
 * The menu panel has no role; CSS shows it only with the `open` class, so
 * that class is how the panel's open state reaches the user.
 */
const menu = () => item().parentElement;

/** A parent that owns the open state, as the InfiniteScroll filters do. */
const Harness = ({ onOpenChange }: { onOpenChange?: (o: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown
      label="Actions"
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        onOpenChange?.(open);
      }}
    >
      <button type="button">Edit</button>
    </Dropdown>
  );
};

const renderUncontrolled = (align?: "left" | "right") =>
  render(
    <>
      <Dropdown label="Actions" align={align}>
        <button type="button">Edit</button>
      </Dropdown>
      <p>Elsewhere</p>
    </>
  );

describe("Dropdown", () => {
  it("names the trigger by its label", () => {
    renderUncontrolled();

    expect(trigger()).toBeVisible();
  });

  it("names an icon trigger by its aria-label", () => {
    render(
      <Dropdown icon={faEllipsisVertical} aria-label="More options">
        <button type="button">Edit</button>
      </Dropdown>
    );

    expect(trigger("More options")).toBeVisible();
  });

  it("styles the trigger with its variant and size", () => {
    render(
      <Dropdown label="Actions" variant="secondary" size="sm">
        <button type="button">Edit</button>
      </Dropdown>
    );

    expect(trigger()).toHaveClass(
      "k-button k-button-secondary k-button-sm k-button-center k-button-shadow k-button-auto-width",
      { exact: true }
    );
  });

  it("starts closed", () => {
    renderUncontrolled();

    expect(menu()).toHaveClass("k-dropdown-menu left", { exact: true });
  });

  it.each(["left", "right"] as const)("aligns the menu %s", (align) => {
    renderUncontrolled(align);

    expect(menu()).toHaveClass(`k-dropdown-menu ${align}`, { exact: true });
  });

  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderUncontrolled();

    await user.click(trigger());

    expect(menu()).toHaveClass("k-dropdown-menu left open", { exact: true });
  });

  it("opens from an icon trigger", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown icon={faEllipsisVertical} aria-label="More options">
        <button type="button">Edit</button>
      </Dropdown>
    );

    await user.click(trigger("More options"));

    expect(menu()).toHaveClass("k-dropdown-menu left open", { exact: true });
  });

  it("closes when the trigger is clicked again", async () => {
    const user = userEvent.setup();
    renderUncontrolled();
    await user.click(trigger());

    await user.click(trigger());

    expect(menu()).toHaveClass("k-dropdown-menu left", { exact: true });
  });

  it("closes on a click outside", async () => {
    const user = userEvent.setup();
    renderUncontrolled();
    await user.click(trigger());

    await user.click(screen.getByText("Elsewhere"));

    expect(menu()).toHaveClass("k-dropdown-menu left", { exact: true });
  });

  it("stays open on a click inside the menu", async () => {
    const user = userEvent.setup();
    renderUncontrolled();
    await user.click(trigger());

    await user.click(item());

    expect(menu()).toHaveClass("k-dropdown-menu left open", { exact: true });
  });

  describe("controlled", () => {
    it("opens through the parent's state", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(trigger());

      expect(menu()).toHaveClass("k-dropdown-menu left open", { exact: true });
    });

    it("closes through the parent's state on a click outside", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Harness />
          <p>Elsewhere</p>
        </>
      );
      await user.click(trigger());

      await user.click(screen.getByText("Elsewhere"));

      expect(menu()).toHaveClass("k-dropdown-menu left", { exact: true });
    });

    it("stays as the parent says when the trigger is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Dropdown label="Actions" isOpen onOpenChange={() => {}}>
          <button type="button">Edit</button>
        </Dropdown>
      );

      await user.click(trigger());

      expect(menu()).toHaveClass("k-dropdown-menu left open", { exact: true });
    });

    it("asks the parent to close when the open trigger is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Dropdown label="Actions" isOpen onOpenChange={onOpenChange}>
          <button type="button">Edit</button>
        </Dropdown>
      );

      await user.click(trigger());

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    // Bug: useOutsideClick calls setIsOpen(false) on every outside mousedown,
    // so a closed controlled Dropdown reports a change that did not happen.
    it.fails(
      "does not report a change on a click outside while closed",
      async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(
          <>
            <Harness onOpenChange={onOpenChange} />
            <p>Elsewhere</p>
          </>
        );

        await user.click(screen.getByText("Elsewhere"));

        expect(onOpenChange).not.toHaveBeenCalled();
      }
    );
  });
});
