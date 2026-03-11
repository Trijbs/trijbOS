import type { WindowState } from "./types";
import type { WindowSnap } from "./window-snap";

export function getAssistTargets(snap: WindowSnap): WindowSnap[] {
  switch (snap) {
    case "left":
      return ["right"];
    case "right":
      return ["left"];
    case "top-left":
      return ["top-right", "bottom-left", "bottom-right"];
    case "top-right":
      return ["top-left", "bottom-left", "bottom-right"];
    case "bottom-left":
      return ["top-left", "top-right", "bottom-right"];
    case "bottom-right":
      return ["top-left", "top-right", "bottom-left"];
  }
}

export function getAssistCandidates(
  windows: WindowState[],
  activeWindowId: string,
): WindowState[] {
  return windows.filter((item) => item.id !== activeWindowId && !item.minimized);
}
