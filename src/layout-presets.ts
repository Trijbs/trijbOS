import { appDefinitions } from "./apps";
import { getHighestZIndex, makeWindow } from "./window-state";
import type { AppId, WindowState } from "./types";
import type { WindowSnap } from "./window-snap";

export type LayoutPresetId = "focus" | "builder";

type LayoutPresetWindow = {
  appId: AppId;
  maximized?: boolean;
  snap?: WindowSnap;
};

type LayoutPreset = {
  description: string;
  id: LayoutPresetId;
  name: string;
  windows: LayoutPresetWindow[];
};

export const layoutPresets: LayoutPreset[] = [
  {
    id: "focus",
    name: "Focus Split",
    description: "Notes and Terminal side by side.",
    windows: [
      { appId: "notes", snap: "left" },
      { appId: "terminal", snap: "right" },
    ],
  },
  {
    id: "builder",
    name: "Builder Grid",
    description: "Explorer on the left with Terminal and Notes stacked on the right.",
    windows: [
      { appId: "file-explorer", snap: "left" },
      { appId: "terminal", snap: "top-right" },
      { appId: "notes", snap: "bottom-right" },
    ],
  },
];

function getOrCreateWindowForApp(
  windows: WindowState[],
  appId: AppId,
): { targetId: string; windows: WindowState[] } {
  const existing = [...windows]
    .filter((item) => item.appId === appId)
    .sort((left, right) => right.zIndex - left.zIndex)[0];

  if (existing) {
    return { targetId: existing.id, windows };
  }

  const nextWindow = makeWindow(appId, getHighestZIndex(windows) + 1);
  return {
    targetId: nextWindow.id,
    windows: [...windows, nextWindow],
  };
}

export function applyLayoutPresetState(
  currentWindows: WindowState[],
  presetId: LayoutPresetId,
): WindowState[] {
  const preset = layoutPresets.find((item) => item.id === presetId);
  if (!preset) {
    return currentWindows;
  }

  let windows = [...currentWindows];

  for (const definition of preset.windows) {
    const resolved = getOrCreateWindowForApp(windows, definition.appId);
    windows = resolved.windows.map((item) =>
      item.id === resolved.targetId
        ? {
            ...item,
            title: appDefinitions[definition.appId].title,
            minimized: false,
            maximized: Boolean(definition.maximized),
            snap: definition.maximized ? null : definition.snap ?? null,
          }
        : item,
    );
  }

  let zIndex = 1;
  return windows.map((item) => {
    const matchedIndex = preset.windows.findIndex((definition) => definition.appId === item.appId);
    if (matchedIndex === -1) {
      return item;
    }

    const next = {
      ...item,
      zIndex,
    };
    zIndex += 1;
    return next;
  });
}
