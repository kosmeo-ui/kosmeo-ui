import { act, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { hydrateRoot } from "react-dom/client";
import RichTextEditor from "../index.js";

const toolbar = () =>
  ["Bold", "Italic", "Underline", "Bullet list", "Numbered list"].map((name) =>
    screen.getByRole("button", { name })
  );

describe("RichTextEditor", () => {
  it("server-renders with the toolbar disabled", () => {
    const html = renderToString(
      <RichTextEditor label="Notes" value="<p>Hi</p>" />
    );
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(container.querySelector("label")).toHaveTextContent("Notes");
    const bold = container.querySelector('button[aria-label="Bold"]');
    expect(bold).toBeDisabled();
  });

  it("hydrates without a mismatch, then mounts the editor", async () => {
    const element = <RichTextEditor label="Notes" value="<p>Hi</p>" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);

    const consoleError = vi.spyOn(console, "error");
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, element, { onRecoverableError });
    });

    expect(consoleError).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(container.querySelector("[contenteditable]")).toHaveTextContent(
        "Hi"
      )
    );
    container.remove();
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
});
