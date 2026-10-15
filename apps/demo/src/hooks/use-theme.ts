import { useLocalStorage } from "@kosmeo-ui/react";
import { useEffect } from "react";

export type Theme = "light" | "dark";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// The library only defines both token sets; choosing, persisting and applying
// the theme is the app's job.
export const useTheme = () => {
  const [stored, setStored] = useLocalStorage<Theme>("demo-theme");
  const theme = stored ?? systemTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return [theme, setStored] as const;
};
