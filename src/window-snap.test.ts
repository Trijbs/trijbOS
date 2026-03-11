import { describe, expect, it } from "vitest";
import { getDragSnapTarget, getSnapBounds, getUnsnapBounds } from "./window-snap";

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

  it("detects a left edge drag target", () => {
    expect(getDragSnapTarget(20, 480, 1440)).toBe("left");
  });

  it("detects a right edge drag target", () => {
    expect(getDragSnapTarget(1004, 420, 1440)).toBe("right");
  });

  it("ignores drags away from snap edges", () => {
    expect(getDragSnapTarget(240, 480, 1440)).toBeNull();
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
});
