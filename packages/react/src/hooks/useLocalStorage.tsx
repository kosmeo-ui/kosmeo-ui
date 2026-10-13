"use client";

import { useState, useEffect, useCallback } from "react";

const LOCAL_STORAGE_CHANGE_EVENT = "localStorageChange";

interface LocalStorageChangeDetail<T> {
  key: string;
  value: T | null;
}

/**
 * Hook to track and sync localStorage changes across the app and tabs.
 * Dispatches custom events so all instances stay in sync within the same tab,
 * and listens to storage events for cross-tab synchronization.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T | null = null
): [T | null, (value: T | null) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    const item = localStorage.getItem(key);
    if (!item) return initialValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | null) => {
      setStoredValue(value);
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      // Dispatch custom event for same-tab listeners
      window.dispatchEvent(
        new CustomEvent<LocalStorageChangeDetail<T>>(
          LOCAL_STORAGE_CHANGE_EVENT,
          { detail: { key, value } }
        )
      );
    },
    [key]
  );

  const removeValue = useCallback(() => {
    setValue(null);
  }, [setValue]);

  useEffect(() => {
    // Handle changes from other instances of this hook within the same tab
    const handleCustomChange = (e: Event) => {
      const event = e as CustomEvent<LocalStorageChangeDetail<T>>;
      if (event.detail.key === key) {
        setStoredValue(event.detail.value);
      }
    };

    // Handle changes from other tabs/windows (storage event fires cross-tab for localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea === localStorage && e.key === key) {
        if (e.newValue === null) setStoredValue(null);
        else {
          try {
            setStoredValue(JSON.parse(e.newValue) as T);
          } catch {
            setStoredValue(null);
          }
        }
      }
    };

    window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleCustomChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        LOCAL_STORAGE_CHANGE_EVENT,
        handleCustomChange
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
