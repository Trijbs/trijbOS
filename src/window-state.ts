import type { AppId, WindowBounds, WindowState } from "./types";

export const defaultWindowBounds: Record<AppId, WindowBounds> = {
  "calculator": { x: 220, y: 88, width: 330, height: 460 },
  "file-explorer": { x: 72, y: 72, width: 780, height: 520 },
  "media-viewer": { x: 180, y: 92, width: 500, height: 400 },
  "notes": { x: 140, y: 96, width: 560, height: 460 },
  "settings": { x: 200, y: 84, width: 680, height: 520 },
  "terminal": { x: 160, y: 110, width: 640, height: 420 },
};

const appTitles: Record<AppId, string> = {
  "calculator": "Calculator",
  "file-explorer": "File Explorer",
  "media-viewer": "Media Viewer",
  "notes": "Notes",
  "settings": "Settings",
  "terminal": "Terminal",
};

export function makeWindow(appId: AppId, zIndex: number): WindowState {
  return {
    id: `${appId}-${crypto.randomUUID()}`,
    appId,
    title: appTitles[appId],
    bounds: defaultWindowBounds[appId],
    minimized: false,
    maximized: false,
    snap: null,
    zIndex,
  };
}

export function getHighestZIndex(windows: WindowState[]) {
  return windows.reduce((max, item) => Math.max(max, item.zIndex), 0);
}

export function getTopWindow(windows: WindowState[]) {
  return [...windows].sort((left, right) => right.zIndex - left.zIndex)[0];
}

export function focusWindowState(windows: WindowState[], id: string) {
  const highest = getHighestZIndex(windows);
  return windows.map((item) =>
    item.id === id ? { ...item, zIndex: highest + 1, minimized: false } : item,
  );
}

export function minimizeWindowState(windows: WindowState[], id: string) {
  return windows.map((item) => (item.id === id ? { ...item, minimized: true } : item));
}

export function maximizeWindowState(windows: WindowState[], id: string) {
  return windows.map((item) =>
    item.id === id
      ? { ...item, maximized: !item.maximized, minimized: false, snap: null }
      : item,
  );
}

export function updateWindowBoundsState(windows: WindowState[], id: string, bounds: WindowBounds) {
  return windows.map((item) =>
    item.id === id ? { ...item, bounds, maximized: false, snap: null } : item,
  );
}

export function snapWindowState(
  windows: WindowState[],
  id: string,
  snap: "left" | "right",
) {
  return windows.map((item) =>
    item.id === id
      ? {
          ...item,
          maximized: false,
          minimized: false,
          snap: item.snap === snap ? null : snap,
        }
      : item,
  );
}

export function launchAppWindowState(
  windows: WindowState[],
  appId: AppId,
  singleInstance = false,
) {
  const highest = getHighestZIndex(windows);
  const existing = windows.find((item) =>
    item.appId === appId && (singleInstance || item.minimized),
  );

  if (existing) {
    return focusWindowState(windows, existing.id);
  }

  return [...windows, makeWindow(appId, highest + 1)];
}

export function toggleTaskbarWindowState(windows: WindowState[], appId: AppId) {
  const matching = windows
    .filter((item) => item.appId === appId)
    .sort((left, right) => right.zIndex - left.zIndex);
  const target = matching[0];

  if (!target) {
    return { type: "launch" as const };
  }

  if (target.minimized) {
    return {
      type: "update" as const,
      windows: focusWindowState(windows, target.id),
    };
  }

  const topWindow = getTopWindow(windows);
  if (topWindow?.id === target.id) {
    return {
      type: "update" as const,
      windows: minimizeWindowState(windows, target.id),
    };
  }

  return {
    type: "update" as const,
    windows: focusWindowState(windows, target.id),
  };
}
