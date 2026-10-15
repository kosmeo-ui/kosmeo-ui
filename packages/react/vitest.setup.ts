import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// jsdom doesn't lay out, so it has no scrollIntoView.
Element.prototype.scrollIntoView ??= () => {};

// Testing Library only auto-cleans when the runner exposes a global afterEach.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
