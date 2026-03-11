import { appDefinitions } from "./apps";
import { getHighestZIndex, makeWindow } from "./window-state";
import type { AppId, WindowState } from "./types";
import type { WindowSnap } from "./window-snap";

export type LayoutPresetId = string;

export type LayoutPresetWindow = {
  appId: AppId;
  maximized?: boolean;
  snap?: WindowSnap;
};

export type LayoutPreset = {
  description: string;
  id: LayoutPresetId;
  name: string;
  windows: LayoutPresetWindow[];
};

export const builtinLayoutPresets: LayoutPreset[] = [
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

export function getAllLayoutPresets(userPresets: LayoutPreset[] = []) {
  return [...builtinLayoutPresets, ...userPresets];
}

export function createLayoutPresetFromWindows(
  windows: WindowState[],
  existingPresets: LayoutPreset[],
): LayoutPreset | null {
  const relevantWindows = windows
    .filter((item) => !item.minimized && (item.maximized || item.snap))
    .sort((left, right) => left.zIndex - right.zIndex);

  if (relevantWindows.length === 0) {
    return null;
  }

  const nextIndex = existingPresets.filter((item) => item.id.startsWith("custom-")).length + 1;

  return {
    id: `custom-${crypto.randomUUID()}`,
    name: `Custom Layout ${nextIndex}`,
    description: `${relevantWindows.length} arranged app${relevantWindows.length === 1 ? "" : "s"}.`,
    windows: relevantWindows.map((item) => ({
      appId: item.appId,
      maximized: item.maximized,
      snap: item.maximized ? undefined : item.snap ?? undefined,
    })),
  };
}

export function isCustomLayoutPreset(presetId: LayoutPresetId) {
  return presetId.startsWith("custom-");
}

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
  presets: LayoutPreset[],
  presetId: LayoutPresetId,
): WindowState[] {
  const preset = presets.find((item) => item.id === presetId);
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
