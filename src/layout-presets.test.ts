import { describe, expect, it } from "vitest";
import { applyLayoutPresetState } from "./layout-presets";
import type { WindowState } from "./types";

const baseWindows: WindowState[] = [
  {
    id: "notes-1",
    appId: "notes",
    title: "Notes",
    bounds: { x: 10, y: 10, width: 560, height: 460 },
    minimized: false,
    maximized: false,
    snap: null,
    zIndex: 2,
  },
];

describe("layout presets", () => {
  it("reuses existing windows and opens missing apps for the focus preset", () => {
    const next = applyLayoutPresetState(baseWindows, "focus");

    expect(next.find((item) => item.appId === "notes")).toMatchObject({
      snap: "left",
      minimized: false,
    });
    expect(next.find((item) => item.appId === "terminal")).toMatchObject({
      snap: "right",
      minimized: false,
    });
  });

  it("applies the builder preset as a three-window layout", () => {
    const next = applyLayoutPresetState([], "builder");

    expect(next.find((item) => item.appId === "file-explorer")?.snap).toBe("left");
    expect(next.find((item) => item.appId === "terminal")?.snap).toBe("top-right");
    expect(next.find((item) => item.appId === "notes")?.snap).toBe("bottom-right");
  });
});
