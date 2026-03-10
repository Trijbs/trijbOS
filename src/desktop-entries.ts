import { FileText, FolderOpen, ImageIcon } from "lucide-react";
import { appDefinitions } from "./apps";
import type { AppId, FileNode } from "./types";

export type DesktopAppEntry = {
  id: AppId;
  kind: "app";
  label: string;
  icon: typeof FolderOpen;
};

export type DesktopFileEntry = {
  id: string;
  kind: "file";
  label: string;
  icon: typeof FolderOpen;
};

export type DesktopEntry = DesktopAppEntry | DesktopFileEntry;

export const defaultDesktopApps: AppId[] = [
  "file-explorer",
  "notes",
  "terminal",
  "settings",
];

export function getDesktopFileIcon(entry: FileNode) {
  if (entry.type === "folder") {
    return FolderOpen;
  }
  if (entry.type === "image") {
    return ImageIcon;
  }
  return FileText;
}

export function buildDesktopEntries(files: FileNode[]): DesktopEntry[] {
  const appEntries: DesktopEntry[] = defaultDesktopApps.map((appId) => {
    const app = appDefinitions[appId];
    return {
      id: app.id,
      kind: "app",
      label: app.title,
      icon: app.icon,
    };
  });

  const fileEntries: DesktopEntry[] = files
    .filter((item) => item.parentId === "desktop")
    .map((item) => ({
      id: item.id,
      kind: "file",
      label: item.name,
      icon: getDesktopFileIcon(item),
    }));

  return [...appEntries, ...fileEntries];
}
