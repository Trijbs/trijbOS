import type { WindowBounds } from "./types";

export const SNAP_EDGE_THRESHOLD = 36;
export type WindowSnap =
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type DragSnapTarget = WindowSnap | "maximize";

export function getMaximizedBounds(
  viewportWidth: number,
  viewportHeight: number,
): WindowBounds {
  return {
    x: 12,
    y: 12,
    width: viewportWidth - 24,
    height: viewportHeight - 88,
  };
}

export function getSnapBounds(
  snap: WindowSnap,
  viewportWidth: number,
  viewportHeight: number,
): WindowBounds {
  const halfWidth = (viewportWidth - 36) / 2;
  const halfHeight = (viewportHeight - 100) / 2;

  if (snap === "top-left") {
    return { x: 12, y: 12, width: halfWidth, height: halfHeight };
  }

  if (snap === "top-right") {
    return { x: halfWidth + 24, y: 12, width: halfWidth, height: halfHeight };
  }

  if (snap === "bottom-left") {
    return { x: 12, y: halfHeight + 24, width: halfWidth, height: halfHeight };
  }

  if (snap === "bottom-right") {
    return { x: halfWidth + 24, y: halfHeight + 24, width: halfWidth, height: halfHeight };
  }

  return {
    x: snap === "left" ? 12 : halfWidth + 24,
    y: 12,
    width: halfWidth,
    height: viewportHeight - 88,
  };
}

export function getDragSnapTarget(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
): DragSnapTarget | null {
  const nearLeft = x <= SNAP_EDGE_THRESHOLD;
  const nearRight = x + width >= viewportWidth - SNAP_EDGE_THRESHOLD;
  const nearTop = y <= SNAP_EDGE_THRESHOLD;
  const nearBottom = y + height >= viewportHeight - SNAP_EDGE_THRESHOLD - 64;

  if (nearTop && nearLeft) {
    return "top-left";
  }

  if (nearTop && nearRight) {
    return "top-right";
  }

  if (nearBottom && nearLeft) {
    return "bottom-left";
  }

  if (nearBottom && nearRight) {
    return "bottom-right";
  }

  if (nearTop) {
    return "maximize";
  }

  if (nearLeft) {
    return "left";
  }

  if (nearRight) {
    return "right";
  }

  return null;
}

export function getUnsnapBounds(
  snap: WindowSnap,
  bounds: WindowBounds,
  viewportWidth: number,
  viewportHeight: number,
): WindowBounds {
  const maxX = Math.max(24, viewportWidth - bounds.width - 24);
  const maxY = Math.max(24, viewportHeight - bounds.height - 96);

  return {
    ...bounds,
    x: snap.includes("left") ? 24 : snap.includes("right") ? maxX : bounds.x,
    y: snap.startsWith("top")
      ? 24
      : snap.startsWith("bottom")
        ? maxY
        : Math.min(Math.max(bounds.y, 24), maxY),
  };
}
