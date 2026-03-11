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

export function getUnsnapBounds(
  snap: "left" | "right",
  bounds: WindowBounds,
  viewportWidth: number,
  viewportHeight: number,
): WindowBounds {
  const maxX = Math.max(24, viewportWidth - bounds.width - 24);
  const maxY = Math.max(24, viewportHeight - bounds.height - 96);

  return {
    ...bounds,
    x: snap === "left" ? 24 : maxX,
    y: Math.min(Math.max(bounds.y, 24), maxY),
  };
}
