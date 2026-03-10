import { useEffect } from "react";
import { applyThemeToDocument } from "./theme-runtime";
import type { ThemePreference } from "./types";

export function useThemeEffect(theme: ThemePreference) {
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyThemeToDocument(theme, document.documentElement, prefersDark);
  }, [theme]);
}
