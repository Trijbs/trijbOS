import { useEffect } from "react";
import { FileText, FolderOpen, ImageIcon } from "lucide-react";
import { appDefinitions } from "./apps";
import { getKeyboardShortcutCommand } from "./keyboard-shortcuts";
import { Launcher } from "./components/Launcher";
import { NotificationCenter } from "./components/NotificationCenter";
import { Taskbar } from "./components/Taskbar";
import { WindowLayer } from "./components/WindowLayer";
import { useSystemStore } from "./system-store";
import type { AppId, FileNode } from "./types";

function getDesktopEntryIcon(entry: FileNode) {
  if (entry.type === "folder") {
    return FolderOpen;
  }
  if (entry.type === "image") {
    return ImageIcon;
  }
  return FileText;
}

export function App() {
  const hydrate = useSystemStore((state) => state.hydrate);
  const hydrated = useSystemStore((state) => state.hydrated);
  const theme = useSystemStore((state) => state.theme);
  const launcherOpen = useSystemStore((state) => state.launcherOpen);
  const notificationsOpen = useSystemStore((state) => state.notificationsOpen);
  const launchApp = useSystemStore((state) => state.launchApp);
  const closeTopWindow = useSystemStore((state) => state.closeTopWindow);
  const minimizeTopWindow = useSystemStore((state) => state.minimizeTopWindow);
  const toggleTopWindowMaximize = useSystemStore((state) => state.toggleTopWindowMaximize);
  const files = useSystemStore((state) => state.files);
  const openFile = useSystemStore((state) => state.openFile);

  const desktopEntries = files.filter((item) => item.parentId === "desktop");

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const mode =
      theme.mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme.mode;

    document.documentElement.dataset.theme = mode;
    document.documentElement.style.setProperty("--accent", theme.accent);
    document.documentElement.style.setProperty("--wallpaper", theme.wallpaper);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const command = getKeyboardShortcutCommand(event);
      if (!command) {
        return;
      }

      event.preventDefault();
      switch (command) {
        case "open-launcher":
          useSystemStore.getState().toggleLauncher(true);
          break;
        case "open-settings":
          useSystemStore.getState().launchApp("settings");
          break;
        case "close-top-window":
          closeTopWindow();
          break;
        case "maximize-top-window":
          toggleTopWindowMaximize();
          break;
        case "minimize-top-window":
          minimizeTopWindow();
          break;
        case "dismiss-overlays":
          useSystemStore.getState().toggleLauncher(false);
          useSystemStore.getState().toggleNotifications(false);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeTopWindow, minimizeTopWindow, toggleTopWindowMaximize]);

  if (!hydrated) {
    return <div className="boot-screen">Booting trijbOS...</div>;
  }

  return (
    <div className="desktop-shell">
      <div className="wallpaper-layer" />
      <main
        className="desktop-canvas"
        onDoubleClick={() => launchApp("file-explorer")}
      >
        <section className="desktop-shortcuts">
          {(["file-explorer", "notes", "terminal", "settings"] as AppId[]).map((appId) => {
            const app = appDefinitions[appId];
            const Icon = app.icon;
            return (
              <button
                className="desktop-shortcut"
                key={app.id}
                onDoubleClick={() => launchApp(app.id)}
                onClick={(event) => event.stopPropagation()}
                type="button"
              >
                <span className="desktop-shortcut-icon">
                  <Icon size={20} />
                </span>
                <span>{app.title}</span>
              </button>
            );
          })}
          {desktopEntries.map((entry) => {
            const Icon = getDesktopEntryIcon(entry);
            return (
              <button
                className="desktop-shortcut"
                key={entry.id}
                onDoubleClick={() => openFile(entry.id)}
                onClick={(event) => event.stopPropagation()}
                type="button"
              >
                <span className="desktop-shortcut-icon">
                  <Icon size={20} />
                </span>
                <span>{entry.name}</span>
              </button>
            );
          })}
        </section>
        <WindowLayer />
      </main>
      <Taskbar />
      {launcherOpen ? <Launcher /> : null}
      {notificationsOpen ? <NotificationCenter /> : null}
    </div>
  );
}
