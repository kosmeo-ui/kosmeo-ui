import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import useOutsideClick from "../useOutsideClick.js";
import { expect, it, vi } from "vitest";
import { useRef } from "react";

const Harness = ({
  onOutside,
  enabled,
}: {
  onOutside: () => void;
  enabled?: boolean;
}) => {
  const inside = useRef<HTMLDivElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  // Stable array so the effect doesn't re-subscribe each render.
  const refs = useRef([inside, floating]).current;
  useOutsideClick(refs, onOutside, enabled);
  return (
    <>
      <div ref={inside}>inside</div>
      <div ref={floating}>floating</div>
      <div>outside</div>
    </>
  );
};

it.each(["inside", "floating"])(
  "does not call onOutside for a press on the %s element",
  async (text) => {
    const user = userEvent.setup();
    const onOutside = vi.fn();
    render(<Harness onOutside={onOutside} />);

    await user.pointer({
      keys: "[MouseLeft>]",
      target: screen.getByText(text),
    });

    expect(onOutside).not.toHaveBeenCalled();
  }
);

it("calls onOutside for a press outside every ref", async () => {
  const user = userEvent.setup();
  const onOutside = vi.fn();
  render(<Harness onOutside={onOutside} />);

  await user.pointer({
    keys: "[MouseLeft>]",
    target: screen.getByText("outside"),
  });

  expect(onOutside).toHaveBeenCalledTimes(1);
});

it("does nothing while disabled", async () => {
  const user = userEvent.setup();
  const onOutside = vi.fn();
  render(<Harness onOutside={onOutside} enabled={false} />);

  await user.pointer({
    keys: "[MouseLeft>]",
    target: screen.getByText("outside"),
  });

  expect(onOutside).not.toHaveBeenCalled();
});
