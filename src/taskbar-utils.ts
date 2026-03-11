import type { FileNode, ThemeMode } from "./types";

export function formatThemeModeLabel(mode: ThemeMode) {
  if (mode === "system") {
    return "System";
  }

  return mode[0].toUpperCase() + mode.slice(1);
}

export function getActiveDirectoryLabel(files: FileNode[], activeDirectoryId: string | null) {
  if (!activeDirectoryId) {
    return "Desktop";
  }

  return files.find((item) => item.id === activeDirectoryId)?.name ?? "Desktop";
}
