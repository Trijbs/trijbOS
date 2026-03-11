import { describe, expect, it } from "vitest";
import {
  applyLayoutPresetState,
  builtinLayoutPresets,
  createLayoutPresetFromWindows,
  getAllLayoutPresets,
} from "./layout-presets";
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
    const next = applyLayoutPresetState(baseWindows, builtinLayoutPresets, "focus");

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
    const next = applyLayoutPresetState([], builtinLayoutPresets, "builder");

    expect(next.find((item) => item.appId === "file-explorer")?.snap).toBe("left");
    expect(next.find((item) => item.appId === "terminal")?.snap).toBe("top-right");
    expect(next.find((item) => item.appId === "notes")?.snap).toBe("bottom-right");
  });

  it("creates a custom layout preset from the current window state", () => {
    const preset = createLayoutPresetFromWindows(
      [
        { ...baseWindows[0], snap: "left" },
        {
          id: "terminal-1",
          appId: "terminal",
          title: "Terminal",
          bounds: { x: 30, y: 30, width: 640, height: 420 },
          minimized: false,
          maximized: false,
          snap: "right",
          zIndex: 3,
        },
      ],
      [],
    );

    expect(preset).toMatchObject({
      name: "Custom Layout 1",
      windows: [
        { appId: "notes", snap: "left" },
        { appId: "terminal", snap: "right" },
      ],
    });
  });

  it("combines built-in and user presets", () => {
    expect(
      getAllLayoutPresets([
        {
          id: "custom-1",
          name: "Custom Layout 1",
          description: "2 arranged apps.",
          windows: [{ appId: "notes", snap: "left" }],
        },
      ]),
    ).toHaveLength(builtinLayoutPresets.length + 1);
  });
});
