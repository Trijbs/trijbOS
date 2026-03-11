import { describe, expect, it } from "vitest";
import { formatThemeModeLabel, getActiveDirectoryLabel } from "./taskbar-utils";
import type { FileNode } from "./types";

const files: FileNode[] = [
  {
    id: "desktop",
    name: "Desktop",
    parentId: null,
    type: "folder",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "documents",
    name: "Documents",
    parentId: null,
    type: "folder",
    createdAt: "",
    updatedAt: "",
  },
];

describe("taskbar utils", () => {
  it("formats theme labels for tray display", () => {
    expect(formatThemeModeLabel("system")).toBe("System");
    expect(formatThemeModeLabel("light")).toBe("Light");
    expect(formatThemeModeLabel("dark")).toBe("Dark");
  });

  it("resolves the active directory label", () => {
    expect(getActiveDirectoryLabel(files, "documents")).toBe("Documents");
    expect(getActiveDirectoryLabel(files, null)).toBe("Desktop");
    expect(getActiveDirectoryLabel(files, "missing")).toBe("Desktop");
  });
});
