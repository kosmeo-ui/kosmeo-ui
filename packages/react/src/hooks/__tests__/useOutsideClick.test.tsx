import { fireEvent, render, screen } from "@testing-library/react";
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

it("calls onOutside for a mousedown outside every ref", () => {
  const onOutside = vi.fn();
  render(<Harness onOutside={onOutside} />);

  fireEvent.mouseDown(screen.getByText("inside"));
  fireEvent.mouseDown(screen.getByText("floating"));
  expect(onOutside).not.toHaveBeenCalled();

  fireEvent.mouseDown(screen.getByText("outside"));
  expect(onOutside).toHaveBeenCalledTimes(1);
});

it("does nothing while disabled", () => {
  const onOutside = vi.fn();
  render(<Harness onOutside={onOutside} enabled={false} />);
  fireEvent.mouseDown(screen.getByText("outside"));
  expect(onOutside).not.toHaveBeenCalled();
});
