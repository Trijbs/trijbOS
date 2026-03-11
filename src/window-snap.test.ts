import { describe, expect, it } from "vitest";
import { getDragSnapTarget, getSnapBounds } from "./window-snap";

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
});
