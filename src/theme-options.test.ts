import { describe, expect, it } from "vitest";
import { accentOptions, wallpaperOptions } from "./theme-options";

describe("theme options", () => {
  it("exposes uniquely identified accent options", () => {
    expect(new Set(accentOptions.map((option) => option.id)).size).toBe(accentOptions.length);
    expect(new Set(accentOptions.map((option) => option.value)).size).toBe(accentOptions.length);
  });

  it("exposes uniquely identified wallpaper options", () => {
    expect(new Set(wallpaperOptions.map((option) => option.id)).size).toBe(wallpaperOptions.length);
    expect(new Set(wallpaperOptions.map((option) => option.value)).size).toBe(wallpaperOptions.length);
  });
});
