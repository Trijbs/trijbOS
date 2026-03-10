import { useEffect } from "react";
import { getKeyboardShortcutCommand } from "./keyboard-shortcuts";
import { DesktopShortcuts } from "./components/DesktopShortcuts";
import { Launcher } from "./components/Launcher";
import { NotificationCenter } from "./components/NotificationCenter";
import { Taskbar } from "./components/Taskbar";
import { WindowLayer } from "./components/WindowLayer";
import { useSystemStore } from "./system-store";
import { useThemeEffect } from "./use-theme-effect";

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

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useThemeEffect(theme);

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
        <DesktopShortcuts files={files} launchApp={launchApp} openFile={openFile} />
        <WindowLayer />
      </main>
      <Taskbar />
      {launcherOpen ? <Launcher /> : null}
      {notificationsOpen ? <NotificationCenter /> : null}
    </div>
  );
}
