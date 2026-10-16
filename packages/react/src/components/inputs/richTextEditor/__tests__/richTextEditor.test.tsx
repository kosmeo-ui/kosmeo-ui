import { hydrate, serverRender } from "../../__tests__/hydration.js";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RichTextEditor from "../index.js";
import {
  getDefaultNormalizer,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const toolbarNames = [
  "Bold",
  "Italic",
  "Underline",
  "Bullet list",
  "Numbered list",
];

/** Waits for TipTap to create the editor, which enables the toolbar. */
const ready = () =>
  waitFor(() => {
    for (const name of toolbarNames)
      expect(screen.getByRole("button", { name })).toBeEnabled();
  });

describe("RichTextEditor", () => {
  describe("server rendering", () => {
    it("server-renders its label", () => {
      serverRender(<RichTextEditor label="Notes" value="<p>Hi</p>" />);

      expect(screen.getByText("Notes")).toBeVisible();
    });

    it("server-renders with the toolbar disabled", () => {
      serverRender(<RichTextEditor label="Notes" value="<p>Hi</p>" />);

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    });

    it("hydrates without a mismatch", async () => {
      const element = <RichTextEditor label="Notes" value="<p>Hi</p>" />;
      const container = serverRender(element);

      const { consoleError, onRecoverableError } = await hydrate(
        container,
        element
      );

      expect(consoleError).not.toHaveBeenCalled();
      expect(onRecoverableError).not.toHaveBeenCalled();
    });

    it("mounts the editor once hydrated", async () => {
      const element = <RichTextEditor label="Notes" value="<p>Hi</p>" />;
      const container = serverRender(element);

      await hydrate(container, element);

      await waitFor(() =>
        expect(
          screen.getByRole("textbox", { name: "Notes" })
        ).toHaveTextContent("Hi")
      );
    });
  });

  it.each(toolbarNames)("enables %s once the editor exists", async (name) => {
    render(<RichTextEditor label="Notes" />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name })).toBeEnabled()
    );
  });

  it("names the editor by its label", async () => {
    render(<RichTextEditor label="Notes" />);

    expect(await screen.findByRole("textbox", { name: "Notes" })).toBeVisible();
  });

  it("makes the editor read-only when disabled", async () => {
    render(<RichTextEditor label="Notes" disabled />);

    await waitFor(() =>
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "contenteditable",
        "false"
      )
    );
  });

  it.each(toolbarNames)(
    "keeps %s disabled when the editor is disabled",
    async (name) => {
      render(<RichTextEditor label="Notes" disabled />);
      await screen.findByRole("textbox");

      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
  );

  describe("editing", () => {
    it("reports the change when a list is applied from the toolbar", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <RichTextEditor label="Notes" value="<p>Hi</p>" onChange={onChange} />
      );
      await ready();

      await user.click(screen.getByRole("button", { name: "Bullet list" }));

      expect(onChange).toHaveBeenLastCalledWith("<ul><li><p>Hi</p></li></ul>");
    });

    it("marks Bullet list pressed once applied", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor label="Notes" value="<p>Hi</p>" />);
      await ready();

      await user.click(screen.getByRole("button", { name: "Bullet list" }));

      expect(
        screen.getByRole("button", { name: "Bullet list" })
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("shows Bold unpressed on plain text", async () => {
      render(<RichTextEditor label="Notes" value="<p>Hi</p>" />);

      await ready();

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("marks Bold pressed once toggled", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor label="Notes" value="<p>Hi</p>" />);
      await ready();

      await user.click(screen.getByRole("button", { name: "Bold" }));

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    describe("HTML source view", () => {
      const renderReady = async () => {
        render(
          <RichTextEditor
            label="Notes"
            value="<p>Hi <strong>there</strong></p>"
          />
        );
        await ready();
      };

      it("shows the HTML source", async () => {
        const user = userEvent.setup();
        await renderReady();

        await user.click(screen.getByRole("button", { name: "Show HTML" }));

        // The source view puts each tag on its own line.
        expect(
          screen.getByText("<p>Hi <strong>there</strong>\n</p>", {
            normalizer: getDefaultNormalizer({
              trim: false,
              collapseWhitespace: false,
            }),
          })
        ).toBeVisible();
      });

      it("hides the editor", async () => {
        const user = userEvent.setup();
        await renderReady();

        await user.click(screen.getByRole("button", { name: "Show HTML" }));

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      });

      it("disables formatting", async () => {
        const user = userEvent.setup();
        await renderReady();

        await user.click(screen.getByRole("button", { name: "Show HTML" }));

        expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
      });

      it("returns to the editor", async () => {
        const user = userEvent.setup();
        await renderReady();
        await user.click(screen.getByRole("button", { name: "Show HTML" }));

        await user.click(screen.getByRole("button", { name: "Show editor" }));

        expect(screen.getByRole("textbox")).toHaveTextContent("Hi there");
      });
    });

    it("takes a new value without reporting it as an edit", async () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <RichTextEditor label="Notes" value="<p>Hi</p>" onChange={onChange} />
      );
      await ready();

      rerender(
        <RichTextEditor label="Notes" value="<p>Bye</p>" onChange={onChange} />
      );
      await waitFor(() =>
        expect(screen.getByRole("textbox")).toHaveTextContent("Bye")
      );

      expect(onChange).not.toHaveBeenCalled();
    });

    it("counts characters", async () => {
      render(
        <RichTextEditor label="Notes" value="<p>Hello</p>" showCharCount />
      );

      await waitFor(() => expect(screen.getByText("5")).toBeVisible());
    });
  });
});
