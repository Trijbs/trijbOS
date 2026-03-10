import { describe, expect, it } from "vitest";
import { inferFileKind, isDesktopSnapshot } from "./import-utils";

describe("import utils", () => {
  it("infers file kinds from browser mime types", () => {
    expect(inferFileKind(new File(["hello"], "note.txt", { type: "text/plain" }))).toBe("text");
    expect(inferFileKind(new File(["bin"], "photo.png", { type: "image/png" }))).toBe("image");
  });

  it("validates desktop snapshot shape", () => {
    expect(
      isDesktopSnapshot({
        exportedAt: "2026-03-10T00:00:00.000Z",
        files: [],
        notifications: [],
        theme: { accent: "#7bf7bf", mode: "dark", wallpaper: "gradient" },
        windows: [],
      }),
    ).toBe(true);

    expect(isDesktopSnapshot({ foo: "bar" })).toBe(false);
  });
});
