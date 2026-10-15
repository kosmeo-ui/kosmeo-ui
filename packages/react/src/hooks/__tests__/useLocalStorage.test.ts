import { act, renderHook } from "@testing-library/react";
import useLocalStorage from "../useLocalStorage.js";
import { describe, expect, it } from "vitest";

describe("useLocalStorage", () => {
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

  it("writes and removes values", () => {
    const { result } = renderHook(() => useLocalStorage<string>("k"));

    act(() => result.current[1]("hello"));
    expect(result.current[0]).toBe("hello");
    expect(localStorage.getItem("k")).toBe('"hello"');

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

  it("picks up changes from other tabs", () => {
    const { result } = renderHook(() => useLocalStorage<number>("k"));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "k",
          newValue: "7",
          storageArea: localStorage,
        })
      );
    });
    expect(result.current[0]).toBe(7);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "k",
          newValue: null,
          storageArea: localStorage,
        })
      );
    });
    expect(result.current[0]).toBeNull();
  });
});
