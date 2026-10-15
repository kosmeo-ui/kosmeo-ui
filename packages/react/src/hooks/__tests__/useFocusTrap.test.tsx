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

it("focuses the first focusable element when enabled", () => {
  render(<App enabled />);
  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
});

it("wraps Tab and Shift+Tab inside the container", async () => {
  const user = userEvent.setup();
  render(<App enabled />);

  await user.tab();
  expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
});

it("restores the previous focus when disabled", () => {
  const { rerender } = render(<App enabled={false} />);
  const outside = screen.getByRole("button", { name: "Outside" });
  outside.focus();

  rerender(<App enabled />);
  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();

  rerender(<App enabled={false} />);
  expect(outside).toHaveFocus();
});
