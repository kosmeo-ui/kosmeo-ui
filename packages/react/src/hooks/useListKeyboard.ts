"use client";

import { Dispatch, KeyboardEvent, SetStateAction, useCallback } from "react";

interface UseListKeyboardOptions {
  isOpen: boolean;
  length: number;
  highlightedIndex: number;
  setHighlightedIndex: Dispatch<SetStateAction<number>>;
  onSelect: (index: number) => void;
  onClose: () => void;
  /** If true, Tab selects highlighted (or first) option. */
  selectOnTab?: boolean;
}

/**
 * Returns a keydown handler that drives arrow-key list navigation,
 * Enter to select, Escape to close, and optional Tab-to-select.
 * Shared by Typeahead and SearchList.
 */
const useListKeyboard = ({
  isOpen,
  length,
  highlightedIndex,
  setHighlightedIndex,
  onSelect,
  onClose,
  selectOnTab = false,
}: UseListKeyboardOptions) =>
  useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!isOpen) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex > -1) onSelect(highlightedIndex);
          break;
        case "Tab":
          if (selectOnTab && length > 0) {
            onSelect(highlightedIndex > -1 ? highlightedIndex : 0);
          }
          break;
        case "Escape":
          onClose();
          setHighlightedIndex(-1);
          break;
      }
    },
    [
      isOpen,
      length,
      highlightedIndex,
      setHighlightedIndex,
      onSelect,
      onClose,
      selectOnTab,
    ]
  );

export default useListKeyboard;
