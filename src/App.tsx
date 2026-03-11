import { useEffect, useState } from "react";
import { DesktopCanvas } from "./components/DesktopCanvas";
import { DesktopShortcuts } from "./components/DesktopShortcuts";
import { Launcher } from "./components/Launcher";
import { NotificationCenter } from "./components/NotificationCenter";
import { Taskbar } from "./components/Taskbar";
import { WindowLayer } from "./components/WindowLayer";
import { useSystemStore } from "./system-store";
import { useShellShortcuts } from "./use-shell-shortcuts";
import { useThemeEffect } from "./use-theme-effect";

export function App() {
  const hydrate = useSystemStore((state) => state.hydrate);
  const hydrated = useSystemStore((state) => state.hydrated);
  const [bootError, setBootError] = useState<string | null>(null);
  const theme = useSystemStore((state) => state.theme);
  const launcherOpen = useSystemStore((state) => state.launcherOpen);
  const notificationsOpen = useSystemStore((state) => state.notificationsOpen);
  const launchApp = useSystemStore((state) => state.launchApp);
  const closeTopWindow = useSystemStore((state) => state.closeTopWindow);
  const minimizeTopWindow = useSystemStore((state) => state.minimizeTopWindow);
  const snapTopWindow = useSystemStore((state) => state.snapTopWindow);
  const toggleTopWindowMaximize = useSystemStore((state) => state.toggleTopWindowMaximize);
  const files = useSystemStore((state) => state.files);
  const openFile = useSystemStore((state) => state.openFile);

  useEffect(() => {
    void hydrate().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown startup error";
      console.error("trijbOS hydration failed", error);
      setBootError(message);
    });
  }, [hydrate]);

  useThemeEffect(theme);
  useShellShortcuts({
    closeTopWindow,
    minimizeTopWindow,
    snapTopWindow,
    toggleTopWindowMaximize,
  });

  if (bootError) {
    return (
      <div className="boot-screen is-error">
        <div className="boot-message">
          <strong>trijbOS failed to start.</strong>
          <span>{bootError}</span>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return <div className="boot-screen">Booting trijbOS...</div>;
  }

  return (
    <div className="desktop-shell">
      <div className="wallpaper-layer" />
      <DesktopCanvas onOpenFileExplorer={() => launchApp("file-explorer")}>
        <DesktopShortcuts files={files} launchApp={launchApp} openFile={openFile} />
        <WindowLayer />
      </DesktopCanvas>
      <Taskbar />
      {launcherOpen ? <Launcher /> : null}
      {notificationsOpen ? <NotificationCenter /> : null}
    </div>
  );
}
