import {
  Calculator,
  FileCode2,
  FolderOpen,
  Image,
  NotebookTabs,
  Settings2,
} from "lucide-react";
import type { AppDefinition, AppId } from "./types";
import { CalculatorApp } from "./components/apps/CalculatorApp";
import { FileExplorerApp } from "./components/apps/FileExplorerApp";
import { MediaViewerApp } from "./components/apps/MediaViewerApp";
import { NotesApp } from "./components/apps/NotesApp";
import { SettingsApp } from "./components/apps/SettingsApp";
import { TerminalApp } from "./components/apps/TerminalApp";

export const appDefinitions: Record<AppId, AppDefinition> = {
  "calculator": {
    id: "calculator",
    title: "Calculator",
    icon: Calculator,
    description: "Quick arithmetic for desktop workflows.",
    defaultBounds: { x: 220, y: 88, width: 330, height: 460 },
    minWidth: 320,
    minHeight: 420,
    keywords: ["math", "calc", "numbers"],
    component: CalculatorApp,
  },
  "file-explorer": {
    id: "file-explorer",
    title: "File Explorer",
    icon: FolderOpen,
    description: "Browse the simulated file system and manage files.",
    defaultBounds: { x: 72, y: 72, width: 780, height: 520 },
    minWidth: 620,
    minHeight: 420,
    singleInstance: true,
    keywords: ["files", "folders", "documents", "storage"],
    component: FileExplorerApp,
  },
  "media-viewer": {
    id: "media-viewer",
    title: "Media Viewer",
    icon: Image,
    description: "Preview wallpaper concepts and media content.",
    defaultBounds: { x: 180, y: 92, width: 500, height: 400 },
    minWidth: 440,
    minHeight: 320,
    keywords: ["image", "picture", "gallery", "media"],
    component: MediaViewerApp,
  },
  "notes": {
    id: "notes",
    title: "Notes",
    icon: NotebookTabs,
    description: "Simple text notes backed by the virtual file system.",
    defaultBounds: { x: 140, y: 96, width: 560, height: 460 },
    minWidth: 420,
    minHeight: 320,
    keywords: ["docs", "markdown", "writing", "memo"],
    component: NotesApp,
  },
  "settings": {
    id: "settings",
    title: "Settings",
    icon: Settings2,
    description: "Appearance, taskbar, and storage controls.",
    defaultBounds: { x: 200, y: 84, width: 680, height: 520 },
    minWidth: 560,
    minHeight: 420,
    singleInstance: true,
    keywords: ["preferences", "theme", "wallpaper", "desktop"],
    component: SettingsApp,
  },
  "terminal": {
    id: "terminal",
    title: "Terminal",
    icon: FileCode2,
    description: "A mock terminal for shell-like workflows and diagnostics.",
    defaultBounds: { x: 160, y: 110, width: 640, height: 420 },
    minWidth: 520,
    minHeight: 320,
    keywords: ["shell", "console", "commands", "logs"],
    component: TerminalApp,
  },
};

export const pinnedApps: AppId[] = [
  "file-explorer",
  "notes",
  "terminal",
  "settings",
];
