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
  trashedFromId?: string | null;
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
  readAt?: string | null;
  tone: "info" | "success" | "warning";
};

export type WorkspaceState = {
  activeDirectoryId: string | null;
  selectedFileIds: string[];
};

export type LayoutPresetWindow = {
  appId: AppId;
  maximized?: boolean;
  snap?: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export type LayoutPreset = {
  description: string;
  id: string;
  name: string;
  windows: LayoutPresetWindow[];
};

export type DesktopSnapshot = {
  exportedAt: string;
  files: FileNode[];
  layoutPresets?: LayoutPreset[];
  notifications: NotificationItem[];
  theme: ThemePreference;
  workspace?: WorkspaceState;
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
  snap: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;
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
  singleInstance?: boolean;
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
