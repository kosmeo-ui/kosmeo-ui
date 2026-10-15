import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Portal from "../index.js";

it("renders into document.body by default", () => {
  const { container } = render(
    <Portal>
      <p>Floating</p>
    </Portal>
  );
  expect(container).toBeEmptyDOMElement();
  expect(screen.getByText("Floating").parentElement).toBe(document.body);
});

it("renders into a given target", () => {
  const target = document.createElement("div");
  document.body.append(target);
  render(
    <Portal target={target}>
      <p>Floating</p>
    </Portal>
  );
  expect(target).toContainElement(screen.getByText("Floating"));
  target.remove();
});
