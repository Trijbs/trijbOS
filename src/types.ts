import type { LucideIcon } from "lucide-react";

export type ThemeMode = "system" | "light" | "dark";

export type ThemePreference = {
  accent: string;
  mode: ThemeMode;
  wallpaper: string;
};

export type FileKind = "folder" | "text" | "image";

export type FileNode = {
  id: string;
  name: string;
  parentId: string | null;
  type: FileKind;
  content?: string;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
};

export type LaunchContext = {
  fileId?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  tone: "info" | "success" | "warning";
};

export type DesktopSnapshot = {
  exportedAt: string;
  files: FileNode[];
  notifications: NotificationItem[];
  theme: ThemePreference;
  windows: WindowState[];
};

export type WindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WindowState = {
  id: string;
  appId: AppId;
  title: string;
  bounds: WindowBounds;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
};

export type AppProps = {
  windowId: string;
};

export type AppDefinition = {
  id: AppId;
  title: string;
  icon: LucideIcon;
  description: string;
  defaultBounds: WindowBounds;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  keywords: string[];
  component: React.ComponentType<AppProps>;
};

export type AppId =
  | "file-explorer"
  | "notes"
  | "calculator"
  | "media-viewer"
  | "terminal"
  | "settings";
