import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import SecretDisplay from "../index.js";

const secret = "sk_live_abc123";

it("shows the value when not revealable", () => {
  render(<SecretDisplay value={secret} />);

  expect(screen.getByText(secret)).toBeVisible();
});

it("has no reveal toggle when not revealable", () => {
  render(<SecretDisplay value={secret} />);

  expect(
    screen.queryByRole("button", { name: /^(Reveal|Hide)$/ })
  ).not.toBeInTheDocument();
});

it("masks the value when revealable", () => {
  render(<SecretDisplay value={secret} revealable />);

  expect(screen.getByText("••••••••••••")).toBeVisible();
  expect(screen.queryByText(secret)).not.toBeInTheDocument();
});

it("masks with a custom character and length", () => {
  render(
    <SecretDisplay value={secret} revealable maskChar="*" maskLength={4} />
  );

  expect(screen.getByText("****")).toBeVisible();
});

it("shows the value when Reveal is clicked", async () => {
  const user = userEvent.setup();
  render(<SecretDisplay value={secret} revealable />);

  await user.click(screen.getByRole("button", { name: "Reveal" }));

  expect(screen.getByText(secret)).toBeVisible();
});

it("turns the toggle into Hide once revealed", async () => {
  const user = userEvent.setup();
  render(<SecretDisplay value={secret} revealable />);

  await user.click(screen.getByRole("button", { name: "Reveal" }));

  expect(screen.getByRole("button", { name: "Hide" })).toBeVisible();
});

it("masks the value again when Hide is clicked", async () => {
  const user = userEvent.setup();
  render(<SecretDisplay value={secret} revealable />);
  await user.click(screen.getByRole("button", { name: "Reveal" }));

  await user.click(screen.getByRole("button", { name: "Hide" }));

  expect(screen.queryByText(secret)).not.toBeInTheDocument();
});

it("has no copy button when copyable is false", () => {
  render(<SecretDisplay value={secret} copyable={false} />);

  expect(
    screen.queryByRole("button", { name: "Copy" })
  ).not.toBeInTheDocument();
});

// userEvent.setup() installs a clipboard stub on navigator, so the copy lands
// there and can be read back.
it.each([
  ["shown", false],
  ["masked", true],
])("copies the real value while it is %s", async (_, revealable) => {
  const user = userEvent.setup();
  render(<SecretDisplay value={secret} revealable={revealable} />);

  await user.click(screen.getByRole("button", { name: "Copy" }));

  await expect(navigator.clipboard.readText()).resolves.toBe(secret);
});

it("keeps working when the clipboard refuses the write", async () => {
  const user = userEvent.setup();
  vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
    new DOMException("Denied", "NotAllowedError")
  );
  render(<SecretDisplay value={secret} />);

  await user.click(screen.getByRole("button", { name: "Copy" }));

  expect(screen.getByRole("button", { name: "Copy" })).toBeVisible();
});

it("renders the leading element", () => {
  render(<SecretDisplay value={secret} leading="API key" />);

  expect(screen.getByText("API key")).toBeVisible();
});
