import type { ThemeMode, ThemePreference } from "./types";

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): Exclude<ThemeMode, "system"> {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
}

export function applyThemeToDocument(
  theme: ThemePreference,
  root: HTMLElement,
  prefersDark: boolean,
) {
  root.dataset.theme = resolveThemeMode(theme.mode, prefersDark);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--wallpaper", theme.wallpaper);
}
