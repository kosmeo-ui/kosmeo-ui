import { Mock, MockInstance, onTestFinished, vi } from "vitest";
import { hydrateRoot, Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act } from "@testing-library/react";
import { ReactElement } from "react";

const roots = new WeakMap<HTMLElement, Root>();

/** Server-renders `element` into a container attached to the document. */
export const serverRender = (element: ReactElement) => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  // Testing Library's cleanup only knows its own roots. Registered per test,
  // as a module-level afterEach would only run for the first file to import
  // this one when files share an environment.
  onTestFinished(() => {
    act(() => roots.get(container)?.unmount());
    container.remove();
  });
  return container;
};

/**
 * Hydrates a `serverRender` container. React 19 reports an attribute mismatch
 * only as a console error, and keeps the server's attribute in the DOM, so
 * both channels are returned for the test to check.
 */
export const hydrate = async (
  container: HTMLElement,
  element: ReactElement
): Promise<{
  consoleError: MockInstance<typeof console.error>;
  onRecoverableError: Mock;
}> => {
  const consoleError = vi.spyOn(console, "error");
  const onRecoverableError = vi.fn();
  await act(async () => {
    roots.set(
      container,
      hydrateRoot(container, element, { onRecoverableError })
    );
  });
  return { consoleError, onRecoverableError };
};
