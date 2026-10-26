import useMediaQuery, { NARROW_SCREEN } from "../useMediaQuery.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { stubScreen } from "./screen.js";
import { createElement } from "react";

describe("useMediaQuery", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([true, false])("reads whether the query matches: %s", (narrow) => {
    stubScreen(narrow);

    const { result } = renderHook(() => useMediaQuery(NARROW_SCREEN));

    expect(result.current).toBe(narrow);
  });

  it.each([true, false])(
    "follows the viewport across the breakpoint to narrow=%s",
    (narrow) => {
      const screen = stubScreen(!narrow);
      const { result } = renderHook(() => useMediaQuery(NARROW_SCREEN));

      screen.resize(narrow);

      expect(result.current).toBe(narrow);
    }
  );

  it("reads false where there is no matchMedia, as in jsdom", () => {
    const { result } = renderHook(() => useMediaQuery(NARROW_SCREEN));

    expect(result.current).toBe(false);
  });

  it("renders false on a server", () => {
    stubScreen(true);
    const Probe = () => String(useMediaQuery(NARROW_SCREEN));

    expect(renderToString(createElement(Probe))).toBe("false");
  });
});
