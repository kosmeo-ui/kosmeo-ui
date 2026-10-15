import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Testing Library only auto-cleans when the runner exposes a global afterEach.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
