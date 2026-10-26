import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useLocalStorage from "../useLocalStorage.js";
import { renderToString } from "react-dom/server";
import { createElement } from "react";

/** Another tab changing a key: no user action in this tab can cause it. */
const otherTabSets = (key: string, newValue: string | null) =>
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue,
        storageArea: localStorage,
      })
    );
  });

describe("useLocalStorage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the initial value when the key is unset", () => {
    const { result } = renderHook(() => useLocalStorage("k", { a: 1 }));

    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("reads an existing JSON value", () => {
    localStorage.setItem("k", JSON.stringify({ a: 2 }));

    const { result } = renderHook(() => useLocalStorage("k"));

    expect(result.current[0]).toEqual({ a: 2 });
  });

  it("falls back to the initial value for malformed JSON", () => {
    localStorage.setItem("k", "{oops");

    const { result } = renderHook(() => useLocalStorage("k", "fallback"));

    expect(result.current[0]).toBe("fallback");
  });

  it("writes a value", () => {
    const { result } = renderHook(() => useLocalStorage<string>("k"));

    act(() => result.current[1]("hello"));

    expect(result.current[0]).toBe("hello");
    expect(localStorage.getItem("k")).toBe('"hello"');
  });

  it("removes a value", () => {
    const { result } = renderHook(() => useLocalStorage<string>("k"));
    act(() => result.current[1]("hello"));

    act(() => result.current[2]());

    expect(result.current[0]).toBeNull();
    expect(localStorage.getItem("k")).toBeNull();
  });

  it("keeps instances with the same key in sync", () => {
    const a = renderHook(() => useLocalStorage<number>("shared"));
    const b = renderHook(() => useLocalStorage<number>("shared"));
    const other = renderHook(() => useLocalStorage<number>("other"));

    act(() => a.result.current[1](42));

    expect(b.result.current[0]).toBe(42);
    expect(other.result.current[0]).toBeNull();
  });

  it.each([
    ["a new value", "7", 7],
    ["a removal", null, null],
  ])("picks up %s from another tab", (_case, newValue, expected) => {
    localStorage.setItem("k", "1");
    const { result } = renderHook(() => useLocalStorage<number>("k"));

    otherTabSets("k", newValue);

    expect(result.current[0]).toBe(expected);
  });

  it("renders the initial value where there is no localStorage, as on a server", () => {
    localStorage.setItem("k", '"stored"');
    vi.stubGlobal("localStorage", undefined);
    const Probe = () => useLocalStorage("k", "initial")[0];

    expect(renderToString(createElement(Probe))).toBe("initial");
  });

  it("ignores other tabs' changes to other keys", () => {
    const { result } = renderHook(() => useLocalStorage<number>("k", 1));

    otherTabSets("other", "7");

    expect(result.current[0]).toBe(1);
  });
});
