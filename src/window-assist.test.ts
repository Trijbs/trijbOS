import { describe, expect, it } from "vitest";
import { getAssistCandidates, getAssistTargets } from "./window-assist";
import type { WindowState } from "./types";

const windows: WindowState[] = [
  {
    id: "terminal-1",
    appId: "terminal",
    title: "Terminal",
    bounds: { x: 10, y: 10, width: 640, height: 420 },
    minimized: false,
    maximized: false,
    snap: "left",
    zIndex: 3,
  },
  {
    id: "notes-1",
    appId: "notes",
    title: "Notes",
    bounds: { x: 40, y: 40, width: 560, height: 460 },
    minimized: false,
    maximized: false,
    snap: null,
    zIndex: 2,
  },
  {
    id: "settings-1",
    appId: "settings",
    title: "Settings",
    bounds: { x: 70, y: 70, width: 680, height: 520 },
    minimized: true,
    maximized: false,
    snap: null,
    zIndex: 1,
  },
];

describe("window assist helpers", () => {
  it("returns the opposite target for left and right halves", () => {
    expect(getAssistTargets("left")).toEqual(["right"]);
    expect(getAssistTargets("right")).toEqual(["left"]);
  });

  it("returns remaining quadrant targets for a quarter tile", () => {
    expect(getAssistTargets("top-left")).toEqual([
      "top-right",
      "bottom-left",
      "bottom-right",
    ]);
  });

  it("returns other visible windows as assist candidates", () => {
    expect(getAssistCandidates(windows, "terminal-1").map((item) => item.id)).toEqual([
      "notes-1",
    ]);
  });
});
