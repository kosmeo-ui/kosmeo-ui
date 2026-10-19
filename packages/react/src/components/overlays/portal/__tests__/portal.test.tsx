import { render, screen } from "@testing-library/react";
import { expect, it, onTestFinished } from "vitest";
import Portal from "../index.js";

it("renders into document.body, outside its render container, by default", () => {
  const { container } = render(
    <Portal>
      <p>Floating</p>
    </Portal>
  );

  expect(container).toBeEmptyDOMElement();
  expect(document.body).toContainElement(screen.getByText("Floating"));
});

it("renders into a given target", () => {
  const target = document.createElement("div");
  document.body.append(target);
  onTestFinished(() => target.remove());

  render(
    <Portal target={target}>
      <p>Floating</p>
    </Portal>
  );

  expect(target).toContainElement(screen.getByText("Floating"));
});
