import type { WindowBounds } from "./types";

export const SNAP_EDGE_THRESHOLD = 36;

export function getSnapBounds(
  snap: "left" | "right",
  viewportWidth: number,
  viewportHeight: number,
): WindowBounds {
  const halfWidth = (viewportWidth - 36) / 2;
  return {
    x: snap === "left" ? 12 : halfWidth + 24,
    y: 12,
    width: halfWidth,
    height: viewportHeight - 88,
  };
}

export function getDragSnapTarget(
  x: number,
  width: number,
  viewportWidth: number,
): "left" | "right" | null {
  if (x <= SNAP_EDGE_THRESHOLD) {
    return "left";
  }

  if (x + width >= viewportWidth - SNAP_EDGE_THRESHOLD) {
    return "right";
  }

  return null;
}
