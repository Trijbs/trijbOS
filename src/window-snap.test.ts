import { describe, expect, it } from "vitest";
import {
  getDragSnapTarget,
  getMaximizedBounds,
  getSnapBounds,
  getUnsnapBounds,
} from "./window-snap";

describe("window snap helpers", () => {
  it("computes left snap bounds for the current viewport", () => {
    expect(getSnapBounds("left", 1440, 900)).toEqual({
      x: 12,
      y: 12,
      width: 702,
      height: 812,
    });
  });

  it("computes right snap bounds for the current viewport", () => {
    expect(getSnapBounds("right", 1440, 900)).toEqual({
      x: 726,
      y: 12,
      width: 702,
      height: 812,
    });
  });

  it("computes top-left quarter bounds for the current viewport", () => {
    expect(getSnapBounds("top-left", 1440, 900)).toEqual({
      x: 12,
      y: 12,
      width: 702,
      height: 400,
    });
  });

  it("computes bottom-right quarter bounds for the current viewport", () => {
    expect(getSnapBounds("bottom-right", 1440, 900)).toEqual({
      x: 726,
      y: 424,
      width: 702,
      height: 400,
    });
  });

  it("computes maximized bounds for the current viewport", () => {
    expect(getMaximizedBounds(1440, 900)).toEqual({
      x: 12,
      y: 12,
      width: 1416,
      height: 812,
    });
  });

  it("detects a left edge drag target", () => {
    expect(getDragSnapTarget(20, 120, 480, 320, 1440, 900)).toBe("left");
  });

  it("detects a right edge drag target", () => {
    expect(getDragSnapTarget(1004, 120, 420, 320, 1440, 900)).toBe("right");
  });

  it("ignores drags away from snap edges", () => {
    expect(getDragSnapTarget(240, 120, 480, 320, 1440, 900)).toBeNull();
  });

  it("detects a top edge drag target for maximize", () => {
    expect(getDragSnapTarget(240, 18, 480, 320, 1440, 900)).toBe("maximize");
  });

  it("detects a top-left corner drag target", () => {
    expect(getDragSnapTarget(18, 18, 480, 320, 1440, 900)).toBe("top-left");
  });

  it("detects a bottom-right corner drag target", () => {
    expect(getDragSnapTarget(1004, 520, 420, 320, 1440, 900)).toBe("bottom-right");
  });

  it("releases a left snapped window into floating bounds", () => {
    expect(
      getUnsnapBounds(
        "left",
        { x: 140, y: 96, width: 560, height: 460 },
        1440,
        900,
      ),
    ).toEqual({
      x: 24,
      y: 96,
      width: 560,
      height: 460,
    });
  });

  it("releases a right snapped window into floating bounds near the right edge", () => {
    expect(
      getUnsnapBounds(
        "right",
        { x: 140, y: 96, width: 560, height: 460 },
        1440,
        900,
      ),
    ).toEqual({
      x: 856,
      y: 96,
      width: 560,
      height: 460,
    });
  });

  it("releases a bottom-left tiled window into floating bounds near the lower left", () => {
    expect(
      getUnsnapBounds(
        "bottom-left",
        { x: 140, y: 96, width: 560, height: 460 },
        1440,
        900,
      ),
    ).toEqual({
      x: 24,
      y: 344,
      width: 560,
      height: 460,
    });
  });
});
