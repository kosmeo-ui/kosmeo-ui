"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has remained unchanged for `delay` milliseconds.
 * Resets the timer on every change.
 */
const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
