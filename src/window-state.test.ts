import { describe, expect, it, vi } from "vitest";
import {
  focusWindowState,
  getTopWindow,
  launchAppWindowState,
  maximizeWindowState,
  minimizeWindowState,
  snapWindowState,
  toggleTaskbarWindowState,
  updateWindowBoundsState,
} from "./window-state";
import type { WindowState } from "./types";

const baseWindows: WindowState[] = [
  {
    id: "notes-1",
    appId: "notes",
    title: "Notes",
    bounds: { x: 10, y: 10, width: 400, height: 300 },
    minimized: false,
    maximized: false,
    snap: null,
    zIndex: 1,
  },
  {
    id: "settings-1",
    appId: "settings",
    title: "Settings",
    bounds: { x: 20, y: 20, width: 500, height: 400 },
    minimized: false,
    maximized: false,
    snap: null,
    zIndex: 2,
  },
];

describe("window state helpers", () => {
  it("focuses a window by raising its z-index and restoring it", () => {
    const next = focusWindowState(
      minimizeWindowState(baseWindows, "notes-1"),
      "notes-1",
    );

    expect(next.find((item) => item.id === "notes-1")).toMatchObject({
      minimized: false,
      zIndex: 3,
    });
    expect(getTopWindow(next)?.id).toBe("notes-1");
  });

  it("toggles the top taskbar window into a minimized state", () => {
    const result = toggleTaskbarWindowState(baseWindows, "settings");

    expect(result.type).toBe("update");
    if (result.type === "update") {
      expect(result.windows.find((item) => item.id === "settings-1")?.minimized).toBe(true);
    }
  });

  it("restores and focuses a minimized taskbar window", () => {
    const minimized = minimizeWindowState(baseWindows, "notes-1");
    const result = toggleTaskbarWindowState(minimized, "notes");

    expect(result.type).toBe("update");
    if (result.type === "update") {
      expect(result.windows.find((item) => item.id === "notes-1")).toMatchObject({
        minimized: false,
        zIndex: 3,
      });
    }
  });

  it("signals that a missing app should be launched from the taskbar", () => {
    expect(toggleTaskbarWindowState(baseWindows, "terminal")).toEqual({ type: "launch" });
  });

  it("toggles top-window maximize state", () => {
    const next = maximizeWindowState(baseWindows, "settings-1");
    expect(next.find((item) => item.id === "settings-1")?.maximized).toBe(true);
    expect(next.find((item) => item.id === "settings-1")?.snap).toBeNull();
  });

  it("drops maximized state when bounds are updated", () => {
    const maximized = maximizeWindowState(baseWindows, "settings-1");
    const next = updateWindowBoundsState(maximized, "settings-1", {
      x: 50,
      y: 60,
      width: 640,
      height: 480,
    });

    expect(next.find((item) => item.id === "settings-1")).toMatchObject({
      maximized: false,
      snap: null,
      bounds: { x: 50, y: 60, width: 640, height: 480 },
    });
  });

  it("toggles snap state for a window", () => {
    const snappedLeft = snapWindowState(baseWindows, "settings-1", "left");
    expect(snappedLeft.find((item) => item.id === "settings-1")).toMatchObject({
      minimized: false,
      maximized: false,
      snap: "left",
    });

    const unsnapped = snapWindowState(snappedLeft, "settings-1", "left");
    expect(unsnapped.find((item) => item.id === "settings-1")?.snap).toBeNull();

    const snappedRight = snapWindowState(unsnapped, "settings-1", "right");
    expect(snappedRight.find((item) => item.id === "settings-1")?.snap).toBe("right");
  });

  it("supports quarter snap state for a window", () => {
    const next = snapWindowState(baseWindows, "notes-1", "top-left");
    expect(next.find((item) => item.id === "notes-1")).toMatchObject({
      minimized: false,
      maximized: false,
      snap: "top-left",
    });
  });

  it("clears snap state when bounds are updated manually", () => {
    const snapped = snapWindowState(baseWindows, "notes-1", "left");
    const next = updateWindowBoundsState(snapped, "notes-1", {
      x: 30,
      y: 40,
      width: 520,
      height: 360,
    });

    expect(next.find((item) => item.id === "notes-1")).toMatchObject({
      snap: null,
      bounds: { x: 30, y: 40, width: 520, height: 360 },
    });
  });

  it("restores a minimized app instead of creating a duplicate window", () => {
    const minimized = minimizeWindowState(baseWindows, "notes-1");
    const randomUuid = vi.spyOn(crypto, "randomUUID");

    const next = launchAppWindowState(minimized, "notes");

    expect(next).toHaveLength(2);
    expect(next.find((item) => item.id === "notes-1")).toMatchObject({
      minimized: false,
      zIndex: 3,
    });
    expect(randomUuid).not.toHaveBeenCalled();
    randomUuid.mockRestore();
  });

  it("focuses an existing single-instance window instead of spawning another one", () => {
    const randomUuid = vi.spyOn(crypto, "randomUUID");

    const next = launchAppWindowState(baseWindows, "settings", true);

    expect(next).toHaveLength(2);
    expect(next.find((item) => item.id === "settings-1")).toMatchObject({
      minimized: false,
      zIndex: 3,
    });
    expect(randomUuid).not.toHaveBeenCalled();
    randomUuid.mockRestore();
  });
});
