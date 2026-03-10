import { useEffect } from "react";
import { getKeyboardShortcutCommand } from "./keyboard-shortcuts";
import { useSystemStore } from "./system-store";

type ShellShortcutHandlers = {
  closeTopWindow: () => void;
  minimizeTopWindow: () => void;
  toggleTopWindowMaximize: () => void;
};

export function useShellShortcuts({
  closeTopWindow,
  minimizeTopWindow,
  toggleTopWindowMaximize,
}: ShellShortcutHandlers) {
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
}
