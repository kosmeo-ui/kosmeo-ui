import { hydrate, serverRender } from "../../__tests__/hydration.js";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RichTextEditor from "../index.js";

const toolbar = () =>
  ["Bold", "Italic", "Underline", "Bullet list", "Numbered list"].map((name) =>
    screen.getByRole("button", { name })
  );

describe("RichTextEditor", () => {
  it("server-renders with the toolbar disabled", () => {
    const container = serverRender(
      <RichTextEditor label="Notes" value="<p>Hi</p>" />
    );
    expect(container.querySelector("label")).toHaveTextContent("Notes");
    const bold = container.querySelector('button[aria-label="Bold"]');
    expect(bold).toBeDisabled();
  });

  it("hydrates without a mismatch, then mounts the editor", async () => {
    const element = <RichTextEditor label="Notes" value="<p>Hi</p>" />;
    const container = serverRender(element);

    const { consoleError, onRecoverableError } = await hydrate(
      container,
      element
    );
    expect(consoleError).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(container.querySelector("[contenteditable]")).toHaveTextContent(
        "Hi"
      )
    );
  });

  it("enables the toolbar once the editor exists", async () => {
    render(<RichTextEditor label="Notes" />);
    await waitFor(() => {
      for (const button of toolbar()) expect(button).toBeEnabled();
    });
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-labelledby",
      expect.stringMatching(/-label$/)
    );
  });

  it("keeps the toolbar disabled when the editor is disabled", async () => {
    render(<RichTextEditor label="Notes" disabled />);
    await waitFor(() =>
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "contenteditable",
        "false"
      )
    );
    for (const button of toolbar()) expect(button).toBeDisabled();
  });

  describe("editing", () => {
    const ready = () =>
      waitFor(() => {
        for (const button of toolbar()) expect(button).toBeEnabled();
      });

    it("applies a list from the toolbar and reports the change", async () => {
      const onChange = vi.fn();
      render(
        <RichTextEditor label="Notes" value="<p>Hi</p>" onChange={onChange} />
      );
      await ready();

      await userEvent.click(
        screen.getByRole("button", { name: "Bullet list" })
      );
      expect(onChange).toHaveBeenLastCalledWith("<ul><li><p>Hi</p></li></ul>");
      expect(
        screen.getByRole("button", { name: "Bullet list" })
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("marks Bold pressed once toggled", async () => {
      render(<RichTextEditor label="Notes" value="<p>Hi</p>" />);
      await ready();
      const bold = screen.getByRole("button", { name: "Bold" });
      expect(bold).toHaveAttribute("aria-pressed", "false");

      await userEvent.click(bold);
      expect(bold).toHaveAttribute("aria-pressed", "true");
    });

    it("shows the HTML source in place of the editor", async () => {
      render(
        <RichTextEditor
          label="Notes"
          value="<p>Hi <strong>there</strong></p>"
        />
      );
      await ready();

      await userEvent.click(screen.getByRole("button", { name: "Show HTML" }));
      // The source view puts each tag on its own line.
      expect(document.querySelector(".k-html-section")?.textContent).toBe(
        "<p>Hi <strong>there</strong>\n</p>"
      );
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();

      await userEvent.click(
        screen.getByRole("button", { name: "Show editor" })
      );
      expect(screen.getByRole("textbox")).toHaveTextContent("Hi there");
    });

    // Known bug: TipTap 3's setContent emits an update by default, and the
    // isInitialized guard is state, so it's still true when that update fires.
    // Flip to `it` once the sync passes `{ emitUpdate: false }`.
    it.fails("takes a new value without reporting it as an edit", async () => {
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
      await waitFor(() =>
        expect(
          document.querySelector(".k-richtext-char-count")
        ).toHaveTextContent("5")
      );
    });
  });
});
