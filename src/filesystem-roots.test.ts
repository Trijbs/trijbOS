import { describe, expect, it } from "vitest";
import { filesystemRoots, isProtectedFileNode } from "./filesystem-roots";

describe("filesystem roots", () => {
  it("defines the seeded root directories", () => {
    expect(filesystemRoots.map((root) => root.id)).toEqual([
      "desktop",
      "documents",
      "downloads",
      "pictures",
      "trash",
    ]);
  });

  it("marks seeded roots as protected", () => {
    expect(isProtectedFileNode("desktop")).toBe(true);
    expect(isProtectedFileNode("trash")).toBe(true);
    expect(isProtectedFileNode("custom-folder")).toBe(false);
  });
});
