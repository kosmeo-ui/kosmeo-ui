import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { server } from "./src/hooks/__tests__/server.js";

// jsdom doesn't lay out, so it has no scrollIntoView, and its ranges can't
// be measured (ProseMirror measures them when RichTextEditor takes focus).
Element.prototype.scrollIntoView ??= () => {};
Range.prototype.getClientRects ??= () =>
  Object.assign([], { item: () => null }) as unknown as DOMRectList;
Range.prototype.getBoundingClientRect ??= () => new DOMRect();

// Any console.error a test doesn't expect fails it, so React warnings can't
// pile up unnoticed. A test that expects one mocks console.error itself, which
// keeps it from reaching this wrapper.
// Installed once: files sharing an environment re-run this setup each time.
type Recorder = typeof console.error & { unexpected?: unknown[][] };
if (!(console.error as Recorder).unexpected) {
  const original = console.error;
  const unexpected: unknown[][] = [];
  console.error = Object.assign(
    (...args: unknown[]) => {
      unexpected.push(args);
      original(...args);
    },
    { unexpected }
  );
}
const unexpectedErrors = (console.error as Recorder).unexpected!;
beforeEach(() => {
  unexpectedErrors.length = 0;
});
afterEach(() => {
  if (unexpectedErrors.length === 0) return;
  const [first] = unexpectedErrors.splice(0);
  throw new Error(
    `Unexpected console.error: ${first.map(String).join(" ").slice(0, 300)}`
  );
});

// The fake network: an unhandled request is reported through console.error,
// which the guard above turns into a failure.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Testing Library only auto-cleans when the runner exposes a global afterEach.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
