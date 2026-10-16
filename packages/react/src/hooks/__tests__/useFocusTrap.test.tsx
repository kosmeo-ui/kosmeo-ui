import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import useFocusTrap from "../useFocusTrap.js";
import { expect, it } from "vitest";
import { useRef } from "react";

const Trap = ({ enabled }: { enabled: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, enabled);
  return (
    <div ref={ref}>
      <button>First</button>
      <button disabled>Disabled</button>
      <button>Last</button>
    </div>
  );
};

const App = ({ enabled }: { enabled: boolean }) => (
  <>
    <button>Outside</button>
    <Trap enabled={enabled} />
  </>
);

it("focuses the first focusable element when rendered enabled", () => {
  render(<App enabled />);

  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
});

it("focuses the first focusable element when it becomes enabled", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<App enabled={false} />);
  await user.click(screen.getByRole("button", { name: "Outside" }));

  rerender(<App enabled />);

  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
});

it("skips disabled elements on Tab", async () => {
  const user = userEvent.setup();
  render(<App enabled />);

  await user.tab();

  expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
});

it("wraps Tab from the last element to the first", async () => {
  const user = userEvent.setup();
  render(<App enabled />);
  await user.tab();

  await user.tab();

  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
});

it("wraps Shift+Tab from the first element to the last", async () => {
  const user = userEvent.setup();
  render(<App enabled />);

  await user.tab({ shift: true });

  expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
});

it("restores the previous focus when disabled", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<App enabled={false} />);
  await user.click(screen.getByRole("button", { name: "Outside" }));
  rerender(<App enabled />);

  rerender(<App enabled={false} />);

  expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
});
